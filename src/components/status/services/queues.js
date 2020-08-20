import {getQueues as _getQueues, purgeQueue as _purgeQueue} from "../../../services/gob";
import {memoize} from "../../../services/utils";

const Tooltips = {
    prepare: "Prepare a remote datasource",
    "prepare.task": "Execute a prepare subtask",
    import: "Import data and convert to GOB format",
    compare: "Compare imported data with current data",
    relate: "Derive relations and store result in the entities",
    relate_table: "Derive relations and generate events",
    fullupdate: "Store events",
    apply: "Apply events",
    relate_update_view: "Update materialized view on a relation",
    check_relation: "Compare relation table with entity relations",
    export: "Export data",
    export_test: "Verify exported data",
    e2e_test: "End-to-end test task",
    e2e_check: "End-to-end test result check",
    workflow: "Start a workflow",
    logs: "Regular log message",
    heartbeat: "Report GOB module to be alive",
    auditlogs: "Audit log message",
    progress: "Progress of a job step in a workflow",
    "prepare.complete": "Result of a prepare subtask",
    "jobstep.result": "Result of a job step in a workflow",
    airflow: "Airflow job control queue",
    task: "Sub-Task request",
    "task.result": "Sub-Task result"
};

const order = Object.keys(Tooltips)

function getOrder(queue) {
    const result = order.indexOf(queue.display);
    return result < 0 ? 999 : result;
}

function isJobQueue(queue) {
    return queue.name.startsWith("gob.workflow")
}

function std_queue(queue) {
    queue.display = queue.name
        .replace(".queue", "")
        .replace("airflow.jobstep.result", "airflow")
        .replace("gob.workflow.", "")
        .replace("gob.audit.", "audit")
        .replace("gob.status.", "")
        .replace("gob.log.", "")
        .replace("gob.", "");
    queue.tooltip = Tooltips[queue.display]
    return queue;
}

// Get new data only if last call is more than 1500 msecs ago
const memoizeGetQueues = memoize( async () =>{
    let result = await _getQueues();
    let queues = result.map(q => std_queue(q)).sort((a, b) => getOrder(a) - getOrder(b))
    let nJobs = result.filter(q => isJobQueue(q)).reduce((sum, q) => sum += q.messages_unacknowledged, 0)
    return {queues, nJobs}
}, 1500)

export async function getQueues() {
    let result = await memoizeGetQueues()
    return result.queues
}

export async function getJobs() {
    let result = await memoizeGetQueues()
    return result.nJobs
}

export function purgeQueue(queue) {
    _purgeQueue(queue);
}
