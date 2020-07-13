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

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      action,
      catalogue,
      collection,
      application: application[collection],
      destination,
      product,
      attribute: product,
      user
    })
  };
  const result = await get("gob_management/job/", requestOptions);
  return {
    ok: result.ok,
    text: await result.text()
  };
}

function isZombie(job) {
  if (job.status === "started") {
    const runtime = moment
      .duration(moment(Date.now()).diff(moment(job.starttime)))
      .asHours();
    return runtime > 12;
  }
  return false;
}

function getJobAttribute(job) {
  const processId = job.processId;
  if (!processId) {
    return "";
  }
  const parts = processId.split(".");
  const length = parts.length;
  if (length > 4) {
    const attribute = parts[length - 1].replace(/_/g, " ");
    return attribute === job.entity ? "" : attribute;
  } else {
    return "";
  }
}

function getDurationSecs(duration, starttime, endtime) {
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

export async function getJobs(filter) {
  let data = await queryJobs(filter);

  let jobs = data.jobs;
  let jobIds = {};

  jobs.forEach(job => {
    // Interpret any UTC date time that is received from the backend in the CET timezone
    const format = "dddd DD MMM YYYY HH:mm:ss";

    job.date = new Date(
      moment(job.day)
        .tz(TZ)
        .startOf("day")
    ).toString();

    const starttime = new Date(moment.utc(job.starttime));
    job.starttime = moment.utc(job.starttime).tz(TZ).format(format)

    const endtime = new Date(moment.utc(job.endtime));
    job.endtime = moment.utc(job.endtime).tz(TZ).format(format);

    job.ago = moment(Date.now()).diff(moment(starttime));
    const duration = moment.duration(
      moment(endtime).diff(moment(starttime))
    );
    job.duration  = duration.format("mm:ss")

    job.status =
      job.status === "started" && isZombie(job) ? "zombie" : job.status;
    job.attribute = getJobAttribute(job);
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
    job.jobId = `${job.name}.${job.source}.${job.application}.${job.catalogue}.${job.entity}.${job.attribute}`;
    if (jobIds[job.jobId]) {
      job.execution = "voorgaande";
    } else if (["scheduled", "started"].includes(job.status)) {
      job.execution = "lopende";
    } else {
      // ended, failed or rejected
      job.execution = "recentste";
      jobIds[job.jobId] = true;
    }
  });
  return jobs;
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

export function getSecure() {
  get("gob_management/secure/");
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
 * Example:
 * padZero(2, 3) => 002
 * padZero(2, 1) => 2
 * padZero(2, 5) => 00002
 *
 * @param val
 * @param length
 * @returns {string}
 */
function padZero(val, length = 2) {
  val += "";
  while (val.length < length) {
    val = "0" + val;
  }
  return val;
}

/**
 * ISO datetime string to day-month format:
 *
 * 2020-04-20T11:31:25.819Z => 20-04
 *
 * @param dtString
 * @returns {string}
 */
function formatDate(dtString) {
  let dt = new Date(dtString);
  return padZero(dt.getDate()) + "-" + padZero(dt.getMonth() + 1);
}

/**
 * Returns the unique values for key in listOfObjects.
 * Optionally takes valueTransform function.
 *
 * @param listOfObjects
 * @param key
 * @returns {any[]}
 */
function uniqueValues(listOfObjects, key) {
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
export async function getJobsSummary(daysAgo) {
  let jobs = await getJobs({ daysAgo: daysAgo || 7 });

  let summary = {};
  let startdates = [
    ...new Set(
      uniqueValues(jobs, "starttime")
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
      summary[job.catalogue][formatDate(job.starttime)][job.name.toLowerCase()];

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
