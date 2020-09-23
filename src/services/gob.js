import _ from "lodash";
import moment from "moment-timezone";
import { get } from "./request";

import {
  querySourceEntities,
  queryLogDays,
  queryLogs,
  queryJob,
  queryJobs,
  queryLogsForJob,
  queryLogsForJobStep
} from "../graphql/queries";
import {TZ} from "./config";

export const catalogOnlyJobs = ["prepare", "export test"];
export const collectionOptionalJobs = ["relate"];

export async function sources() {
  var data = await querySourceEntities();
  return _.uniq(
    data.sourceEntities.map(item => item.source).filter(source => source)
  );
}

export async function getCatalogs() {
  var data = await querySourceEntities();
  return _.uniq(
    data.sourceEntities
      .map(item => item.catalogue)
      .filter(catalogue => catalogue)
  );
}

export async function entities(source, catalogue) {
  var data = await querySourceEntities();
  data = data.sourceEntities.filter(item => item.source && item.catalogue);
  if (source) {
    data = data.filter(item => item.source === source);
  }
  if (catalogue) {
    data = data.filter(item => item.catalogue === catalogue);
  }
  return _.uniqBy(data, item => item.entity);
}

export async function logDays(source, catalogue, entity) {
  var logDays = await queryLogDays(source, catalogue, entity);
  return logDays.logDays;
}

function _logs(data) {
  var logs = data.logs.edges.map(edge => edge.node);
  logs.forEach(log => {
    log.data = JSON.parse(JSON.parse(log.data));
  });

  return logs;
}

export async function logs(source, catalogue, entity) {
  var data = await queryLogs(source, catalogue, entity);
  return _logs(data);
}

export async function logsForJob(jobid) {
  var data = await queryLogsForJob(jobid);
  return _logs(data);
}

export async function logsForJobStep(jobid, stepid) {
  var data = await queryLogsForJobStep(jobid, stepid);
  return _logs(data);
}

export async function getJob(id) {
  var data = await queryJob(id);

  var jobinfos = data.jobinfo;
  if (jobinfos) {
    // jobInfo args is a jsonified string
    jobinfos.forEach(jobInfo => {
      jobInfo.args = JSON.parse((jobInfo.args || "[]").replace(/'/g, '"'))
      // export to Database => dump
      if (jobInfo.type === 'export' && jobInfo.args.includes('Database')) {
        jobInfo.type = 'dump'
      }
    })
  }
  return jobinfos ? jobinfos[0] : null;
}

export async function getCatalogCollections() {
  const result = await get("gob_management/catalogs/");
  if (result.ok) {
    return result.json();
  } else {
    return [];
  }
}

export async function purgeQueue(queue) {
  const requestOptions = {
    method: "DELETE"
  };
  const result = await get(
    `gob_management/queue/${queue.name}`,
    requestOptions
  );
  return result.ok;
}

export async function deleteJob(job) {
  const requestOptions = {
    method: "DELETE"
  };
  const result = await get(`gob_management/job/${job.jobid}`, requestOptions);
  return result.ok;
}

export async function createJob(action, catalogue, collection, product, user) {
  const application = {
    bouwblokken: "DGDialog",
    buurten: "DGDialog",
    wijken: "DGDialog",
    stadsdelen: "DGDialog"
  };

  let destination = "Objectstore";
  action = action.toLowerCase().replace(" ", "_");
  if (action === "dump") {
    action = "export";
    destination = "Database";
  }
  catalogue = catalogue.toLowerCase();
  collection = collection ? collection.toLowerCase() : null;
  product = product || null;
  user = user || null;

  const body = {
    action,
    catalogue,
    collection,
    application: application[collection],
    destination,
    product,
    attribute: product,
    user
  }

  if (action === "relate") {
    body.mode = 'update'
  }

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
  const result = await get("gob_management/job/", requestOptions);
  if (result.ok) {
    return {
      ok: result.ok,
      text: await result.text()
    };
  } else {
    return {
      ok: false,
      text: `Start van ${action} mislukt`
    };
  }
}

export function isZombie(job) {
  if (job.status === "started") {
    const runtime = moment
      .duration(moment(Date.now()).diff(moment(job.isoStarttime)))
      .asHours();
    return runtime > 12;
  }
  return false;
}

export function getDurationSecs(duration, starttime, endtime) {
  if (duration) {
    const parts = duration.split(":");
    if (parts.length === 3) {
      return parts.reduce((sum, part) => sum * 60 + Number.parseInt(part), 0);
    } else {
      return Math.round(
        Math.abs(new Date(endtime) - new Date(starttime)) / 1000
      );
    }
  } else {
    return 300;
  }
}

export function enrichJob(job, jobIds) {
  // Interpret any UTC date time that is received from the backend in the CET timezone
  const format = "dddd DD MMM YYYY HH:mm:ss";

  job.date = new Date(
      moment(job.day)
          .tz(TZ)
          .startOf("day")
  ).toString();

  job.rawStarttime = job.rawStarttime || job.starttime
  const starttime = new Date(moment.utc(job.rawStarttime));
  job.isoStarttime = starttime.toISOString()
  job.starttime = moment.utc(job.rawStarttime).tz(TZ).format(format)

  // Take original endtime (rawEndtime) or endtime (single job)
  job.rawEndtime = job.endtime ? job.rawEndtime || job.endtime : null
  const endtime = job.rawEndtime && new Date(moment.utc(job.rawEndtime));
  if (endtime) {
    job.isoEndtime = endtime.toISOString();
    job.endtime = moment.utc(job.endtime).tz(TZ).format(format);
    const duration = moment.duration(
        moment(endtime).diff(moment(starttime))
    );
    job.duration = duration.humanize()
  } else {
    job.isoEndtime = null;
    job.endtime = null;
    job.duration = null;
  }

  job.ago = moment().diff(moment(starttime));

  job.status =
      job.status === "started" && isZombie(job) ? "zombie" : job.status;
  job.brutoSecs = getDurationSecs(
      job.brutoDuration,
      starttime,
      endtime
  );
  job.nettoSecs = getDurationSecs(
      job.nettoDuration,
      starttime,
      endtime
  );
  job.jobId = `${job.name}.${job.catalogue}.${job.entity}.${job.attribute}`;
  if (jobIds[job.jobId]) {
    job.execution = "voorgaande";
  } else if (["scheduled", "started"].includes(job.status)) {
    job.execution = "lopende";
  } else {
    // ended, failed or rejected
    job.execution = "recentste";
    jobIds[job.jobId] = true;
  }

  job.description = `${job.name} ${job.catalogue || ''} ${job.entity || ''}`
  if (job.attribute) {
    job.description += ` (${job.attribute})`
  }
  return job
}

export const AGGREGATE_ON_JOB = "job"
export const AGGREGATE_ON_PROCESS = "process"

export const messageTypes = [
  {text: "Info", key: "infos"},
  {text: "Warning", key: "warnings"},
  {text: "Error", key: "errors"},
  {text: "Data Info", key: "datainfos"},
  {text: "Data Warning", key: "datawarnings"},
  {text: "Data Error", key: "dataerrors"}
]

export async function getJobs(filter) {
  const data = await queryJobs(filter);

  const jobs = data.jobs;
  const processes = {}    // Derive processes from jobs

  // Track instances of jobs and processes (to set recentste, voorgaande, etcetera)
  const jobIds = {};
  const processIds = {}

  const result = [];
  jobs.forEach(job => {
    enrichJob(job, jobIds);
    job.aggregateLevel = AGGREGATE_ON_JOB

    const process = jobProcess(job, processes)
    process.aggregateLevel = AGGREGATE_ON_PROCESS
    if (process.jobs.length === 1) {
      // New process, add to result set before first job of the process
      result.push(process)
    }
    // A process is just a job with subjobs, treat as a job
    enrichJob(process, processIds)

    result.push(job)
  });
  return result
}

export function addDurations(duration1, duration2) {
  const seconds = moment.duration(duration1).asSeconds() + moment.duration(duration2).asSeconds()
  const hours = Math.floor(seconds / 3600)
  return `${hours}:${new Date(1000 * seconds).toISOString().substr(14, 5)}`
}

export function jobProcess(job, processes) {
  const statusses = [
    "rejected",
    "failed",
    "scheduled",
    "started",
    "ended"
  ]

  const initCounts = Object.values(messageTypes)
      .reduce((obj, messageType) => ({...obj, [messageType.key]: 0}), {})

  if (! processes[job.processId]) {
    processes[job.processId] = {
      ...initCounts,
      jobid: job.processId,
      ageCategory: '',
      nettoDuration: '0:00:00',
      brutoDuration: '0:00:00',
      rawEndtime: job.rawEndtime,
      rawStarttime: job.rawStarttime,
      jobs: []
    }
  }
  const process = processes[job.processId]

  // Add job to process jobs
  process.jobs.push(job)
  // Update message counts
  Object.keys(initCounts).forEach(cnt => process[cnt] += job[cnt])
  // Process is characterised by first job (last in list of jobs) so copy last known job contents
  const attributes = [
    "processId",
    "day",
    "name",
    "source",
    "application",
    "catalogue",
    "entity",
    "attribute",
    "user"
  ]
  attributes.forEach(attr => process[attr] = job[attr])
  // Unique jobid
  process.jobid = `P_${job.jobid}`
  // Latest endtime
  if (!job.rawEndtime) {
    // One job is not finished => process is not finished
    process.rawEndtime = null
  } else if (process.rawEndtime && job.rawEndtime > process.rawEndtime) {
    // Set latest endtime but do not overwrite when one of the jobs has not finished
    process.rawEndtime = job.rawEndtime
  }
  // Starttime of first job of process
  process.rawStarttime = job.rawStarttime
  // Set as original start/end values
  process.starttime = process.rawStarttime
  process.endtime = process.rawEndtime
  // Set to most pessimistic status
  const jobStatusses = process.jobs.map(job => job.status)
  process.status = null
  statusses.forEach(status => {
    if (!process.status && jobStatusses.includes(status)) {
      process.status = status
    }
  })
  // Set to max age category
  if (job.ageCategory > process.ageCategory) {
    process.ageCategory = job.ageCategory
  }
  // Add durations
  process.nettoDuration = addDurations(process.nettoDuration, job.nettoDuration)
  process.brutoDuration = addDurations(process.brutoDuration, job.brutoDuration)
  return process
}

export function jobRunsOnDate(job, date) {
  // Interpret any UTC date time that is received from the backend in the CET timezone
  const startDate = moment(job.starttime)
    .tz(TZ)
    .startOf("day");
  const endDate = moment(job.endtime || job.starttime)
    .tz(TZ)
    .endOf("day");
  return startDate <= date && date <= endDate;
}

export async function getQueues() {
  const result = await get("gob_management/queues/");
  if (result.ok) {
    return result.json();
  } else {
    return [];
  }
}

/**
 * ISO datetime string to day-month format:
 *
 * 2020-04-20T11:31:25.819Z => Mo 20-04
 *
 * @param dtString
 * @returns {string}
 */
export function formatDate(dtString) {
  let dt = new Date(dtString);
  return moment(dt).tz(TZ).format("dd DD-MM")
}

/**
 * Returns the unique values for key in listOfObjects.
 * Optionally takes valueTransform function.
 *
 * @param listOfObjects
 * @param key
 * @returns {any[]}
 */
export function uniqueValues(listOfObjects, key) {
  // Filters get unique values for key from listOfObjects, ignoring null values.
  return [...new Set(listOfObjects.filter(o => o[key]).map(o => o[key]))];
}

/**
 * Returns summary of jobs from last n days including today. Default is 7 days.
 * Includes only the most recent job of a kind (type, catalogue, entity, application, ... ) for a day.
 *
 * Format:
 * {
 *     'bag': {
 *         '04-17': {
 *             'export': {
 *                 'jobs': [.., .. , ..]
 *                 'total_jobs': 10,
 *                 'with_errors': 5,
 *                 'bruto_total': 204,
 *                 'netto_total': 024
 *             },
 *             ...
 *         },
 *         '04-18': {
 *             ...
 *         }
 *         ...
 *     },
 *     'brk': {
 *         ...
 *     },
 *     ...
 * }
 */
export async function getJobsSummary(jobs) {
  let summary = {};
  let startdates = [
    ...new Set(
      uniqueValues(jobs, "isoStarttime")
        .sort((a, b) => (new Date(a) > new Date(b) ? 1 : -1))
        .map(o => formatDate(o))
    )
  ];
  // Pre-initialise result matrix, so that all combinations are present.
  for (let c of uniqueValues(jobs, "catalogue")) {
    summary[c] = {};
    for (let d of startdates) {
      summary[c][d] = {};
      for (let j of uniqueValues(jobs, "name")) {
        summary[c][d][j.toLowerCase()] = {
          jobs: [],
          total_jobs: 0,
          with_errors: 0,
          bruto_total: 0,
          netto_total: 0
        };
      }
    }
  }

  for (let job of jobs.filter(j => j.starttime && j.catalogue && j.name)) {
    let entry =
      summary[job.catalogue][formatDate(job.isoStarttime)][job.name.toLowerCase()];

    // Only add job if no job exists yet with the same jobId (meaning it is the same type of job)
    // Jobs are in descending chronological order, so we only keep the most recent job of a type per day.
    let existingJob = entry.jobs.filter(j => j.jobId === job.jobId);

    if (!existingJob.length) {
      entry.jobs.push(job);
      entry.total_jobs += 1;
      entry.bruto_total += job.brutoSecs;
      entry.netto_total += job.nettoSecs;

      if (job.errors) {
        entry.with_errors += 1;
      }
    }
  }
  return summary;
}
