<template>
  <div v-if="queues">
    <h3>Processes</h3>
    <table align="center">
      <tr class="font-weight-bold">
        <td align="left" colspan="2">Process</td>
        <td align="right" colspan="2">Waiting</td>
        <td align="right" colspan="2">Processing</td>
      </tr>
      <tr class="font-weight-bold">
        <td colspan="2" align="left"><span>&Sigma;</span></td>
        <td colspan="2" align="right">
          {{ queues.reduce((a, b) => a + b.messages_ready, 0) }}
        </td>
        <td colspan="2" align="right">
          {{ queues.reduce((a, b) => a + b.messages_unacknowledged, 0) }}
        </td>
      </tr>
      <tr v-for="queue in queues" :key="queue.name">
        <td align="left" :title="queue.name">
          <font-awesome-icon
            icon="exclamation-circle"
            title="unused queue"
            v-if="!Tooltips[queue.display]"
          ></font-awesome-icon>
          {{ Tooltips[queue.display] || queue.display }}
        </td>
        <td>
          <b-btn
            v-if="isAdmin() && queue.messages_ready > 0"
            size="sm"
            @click="purgeQueue(queue)"
          >
            <font-awesome-icon icon="trash-alt" class="fa-xs" />
          </b-btn>
        </td>
        <td>
          <img
            v-for="n in Math.min(queue.messages_ready, MAX_READY)"
            :key="n"
            src="../assets/waiting.gif"
            height="20px"
          />
          <span v-if="queue.messages_ready > MAX_READY">...</span>
        </td>
        <td align="right">
          {{ queue.messages_ready }}
        </td>
        <td>
          <img
            v-for="n in Math.min(queue.messages_unacknowledged, MAX_READY)"
            :key="n"
            src="../assets/processing.gif"
            height="20px"
          />
          <span v-if="queue.messages_unacknowledged > MAX_READY">...</span>
        </td>
        <td align="right">{{ queue.messages_unacknowledged }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
import { getQueues, purgeQueue } from "../services/gob";
import auth from "../services/auth";

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

const order = Object.keys(Tooltips);

function getOrder(queue) {
  const result = order.indexOf(queue.display);
  return result < 0 ? 999 : result;
}

export default {
  name: "Queues",
  data() {
    return {
      queues: null,
      interval: null,
      MAX_READY: 4,
      Tooltips
    };
  },
  methods: {
    isAdmin() {
      return auth.isAdmin();
    },
    std_queue(queue) {
      queue.display = queue.name
        .replace(".queue", "")
        .replace("airflow.jobstep.result", "airflow")
        .replace("gob.workflow.", "")
        .replace("gob.audit.", "audit")
        .replace("gob.status.", "")
        .replace("gob.log.", "")
        .replace("gob.", "");
      return queue;
    },
    async purgeQueue(queue) {
      purgeQueue(queue);
    },
    async update() {
      let queues = await getQueues();
      this.queues = queues
        .map(q => this.std_queue(q))
        .sort((a, b) => getOrder(a) - getOrder(b));
    }
  },
  async mounted() {
    await this.update();
    this.interval = setInterval(this.update, 5000);
  },
  destroyed() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
  watch: {}
};
</script>

<style scoped>
td {
  padding-right: 25px;
}
tr:nth-child(even) {
  background-color: #f2f2f2;
}
</style>
