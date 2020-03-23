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

export const catalogOnlyJobs = ["prepare", "export test"];
export const collectionOptionalJobs = ["relate"];

export async function sources() {
  var data = await querySourceEntities();
  return _.uniq(
    data.sourceEntities.map(item => item.source).filter(source => source)
  );
}

export async function catalogues() {
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

export async function catalogCollections() {
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
    job.date = new Date(
      moment(job.day)
        .tz("CET")
        .startOf("day")
    );
    job.ago = moment(Date.now()).diff(moment(job.starttime));
    job.duration = moment.duration(
      moment(job.endtime).diff(moment(job.starttime))
    );
    job.status =
      job.status === "started" && isZombie(job) ? "zombie" : job.status;
    job.attribute = getJobAttribute(job);
    job.brutoSecs = getDurationSecs(
      job.brutoDuration,
      job.starttime,
      job.endtime
    );
    job.nettoSecs = getDurationSecs(
      job.nettoDuration,
      job.starttime,
      job.endtime
    );
    const jobId = `${job.name}.${job.source}.${job.application}.${job.entity}.${job.attribute}`;
    if (jobIds[jobId]) {
      job.execution = "voorgaande";
    } else {
      job.execution = "recentste";
      jobIds[jobId] = true;
    }
  });
  return jobs;
}

export function jobRunsOnDate(job, date) {
  // Interpret any UTC date time that is received from the backend in the CET timezone
  const startDate = moment(job.starttime)
    .tz("CET")
    .startOf("day");
  const endDate = moment(job.endtime || job.starttime)
    .tz("CET")
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
