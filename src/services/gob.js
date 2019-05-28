import _ from "lodash";
import moment from "moment-timezone";

import {
  querySourceEntities,
  queryLogDays,
  queryLogs,
  queryJob,
  queryJobs,
  queryLogsForJob,
  queryLogsForJobStep
} from "../graphql/queries";

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

export async function logsForJob(process_id) {
  var data = await queryLogsForJob(process_id);
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

export async function getJobs(filter) {
  var data = await queryJobs(filter);

  // Interpret any UTC date time that is received from the backend in the CET timezone
  var jobs = data.jobs
    .filter(job => job.processId)
    .map(job => ({
      ...job,
      date: new Date(
        moment(job.day)
          .tz("CET")
          .startOf("day")
      ),
      duration: moment.duration(moment(job.endtime).diff(moment(job.starttime)))
    }));
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
  var xhr = new XMLHttpRequest();
  xhr.open(
    "GET",
    "https://acc.api.data.amsterdam.nl/gob_management/secure/",
    true
  );
  xhr.send();
  xhr.onreadystatechange = () =>
    console.log("Received", xhr.readyState, xhr.status, xhr.response);
}
