import _ from "lodash";
import moment from "moment";

import {
  querySourceEntities,
  queryLogDays,
  queryLogs,
  queryLogsForJob
} from "../graphql/queries";

export async function sources() {
  var data = await querySourceEntities();
  return _.uniq(data.sourceEntities.map(item => item.source));
}

export async function catalogues() {
  var data = await querySourceEntities();
  return _.uniq(data.sourceEntities.map(item => item.catalogue));
}

export async function entities(source, catalogue) {
  var data = await querySourceEntities();
  data = data.sourceEntities;
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

export function jobs(logs) {
  var processIds = _.uniq(logs.map(log => log.processId));

  // Sort logs, oldest first
  logs = _.orderBy(logs, ["logid"]);

  return processIds.map(processId => {
    var jobLogs = logs.filter(log => log.processId === processId);
    return {
      startLog: jobLogs[0],
      endLog: jobLogs[jobLogs.length - 1],
      logLevels: _.uniq(jobLogs.map(log => log.level)),
      processId: jobLogs[0].processId,
      jobLogs
    };
  });
}

export function jobRunsOnDate(job, date) {
  var startDate = moment(job.startLog.timestamp).startOf("day");
  var endDate = moment(job.endLog.timestamp).endOf("day");
  var onDate = new Date(date);
  return startDate <= onDate && onDate <= endDate;
}

export function logJobs(logDays) {
  return _.groupBy(logDays, "job");
}

export function logLevels(logDays) {
  return _.groupBy(logDays, "level");
}

export function logDates(logDays) {
  return _.groupBy(logDays, "date");
}
