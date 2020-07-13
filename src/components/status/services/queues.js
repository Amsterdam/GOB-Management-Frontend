import {getQueues as _getQueues, purgeQueue as _purgeQueue} from "../../../services/gob";

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

export async function getQueues() {
    let queues = await _getQueues();
    return queues
        .map(q => std_queue(q))
        .sort((a, b) => getOrder(a) - getOrder(b));
}

export function purgeQueue(queue) {
    _purgeQueue(queue);
}
