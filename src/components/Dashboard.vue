<template>
  <div>
    <h1>Dashboard</h1>
    <div v-if="jobs.length">
      <b-form-select
        v-model="selectedCatalog"
        :options="catalogs"
        class="mb-2"
      ></b-form-select>
      <div v-if="selectedCatalog">
        <div>
          <h2>{{ selectedCatalog.toUpperCase() }}</h2>
        </div>
        <b-row>
          <b-col
            v-for="process in PROCESSES"
            :key="process"
            :set="(link = process.replace('_', ' '))"
          >
            <h3>
              <a
                target="_blank"
                :href="
                  `/jobs?catalogue=${selectedCatalog}&name=${link}&execution=recentste`
                "
                >{{ process }}</a
              >
            </h3>
            <div class="small">
              <div v-if="stats[selectedCatalog][process]['warnings']">
                warnings:
                <a
                  target="_blank"
                  :href="
                    `/jobs?catalogue=${selectedCatalog}&name=${link}&messageTypes=warnings&execution=recentste`
                  "
                  >{{ stats[selectedCatalog][process]["warnings"] }}</a
                >
              </div>
              <div v-else>
                &nbsp;
              </div>
              <div v-if="stats[selectedCatalog][process]['errors']">
                errors:
                <a
                  target="_blank"
                  :href="
                    `/jobs?catalogue=${selectedCatalog}&name=${link}&messageTypes=errors&execution=recentste`
                  "
                  >{{ stats[selectedCatalog][process]["errors"] }}</a
                >
              </div>
              <div v-else>
                &nbsp;
              </div>
            </div>
            <GChart
              :settings="{ packages: ['corechart'] }"
              type="PieChart"
              :data="jobData[selectedCatalog][process]"
              :options="chartOptions.pieChart"
            />
          </b-col>
        </b-row>
        <GChart
          :settings="{ packages: ['timeline'] }"
          type="Timeline"
          :data="timeData[selectedCatalog]"
          :options="chartOptions"
          class="timechart"
        />
      </div>
    </div>
    <div v-else>
      Loading...
    </div>
  </div>
</template>

<script>
import moment from "moment";
import { GChart } from "vue-google-charts";

import { getJobs, catalogues } from "../services/gob";

const PROCESSES = ["import", "relate", "export", "export_test", "dump"];

export default {
  name: "Dashboard",
  components: {
    GChart
  },
  data() {
    return {
      jobs: [],
      catalogs: [],
      selectedCatalog: null,
      timeData: {},
      jobData: {},
      chartOptions: {
        pieChart: {
          legend: "none",
          slices: {
            0: { color: "green" },
            1: { color: "orange", offset: 0.1 },
            2: { color: "red", offset: 0.2 }
          }
        },
        timeline: {
          legend: "none",
          showRowLabels: false
        },
        hAxis: {
          format: "HH:mm"
        }
      },
      stats: {},
      PROCESSES
    };
  },
  filters: {
    formatDate(value) {
      if (value) {
        return moment(String(value)).format("DD-MM-YYYY HH:mm");
      }
    }
  },
  methods: {
    pretty: function(value) {
      return JSON.stringify(value, null, 2);
    },

    firstProcess(catalog, process) {
      const EOT = new Date("2099-12-31");
      const first = this.jobs.reduce(
        (first, job) =>
          job.catalogue === catalog &&
          job.name.toLowerCase() === process &&
          new Date(job.starttime) < first
            ? new Date(job.starttime)
            : first,
        EOT
      );
      return first === EOT ? null : first;
    },

    lastProcess(catalog, process) {
      const BOT = new Date("2000-01-01");
      const last = this.jobs.reduce(
        (last, job) =>
          job.catalogue === catalog &&
          job.name.toLowerCase() === process &&
          new Date(job.endtime) > last
            ? new Date(job.endtime)
            : last,
        BOT
      );
      return last === BOT ? null : last;
    }
  },
  async mounted() {
    let jobs = await getJobs();
    let catalogs = await catalogues();

    jobs = jobs.filter(job => job.execution === "recentste");

    this.jobs = jobs;
    this.catalogs = catalogs;
    this.selectedCatalog = catalogs && catalogs[0];

    const prs = ["import", "relate", "export", "export_test", "dump"];

    this.catalogs.forEach(catalog => {
      this.timeData[catalog] = [
        [
          { type: "string", id: "Verwerking" },
          { type: "string", id: "row label" },
          { type: "date", id: "Start" },
          { type: "date", id: "Eind" }
        ]
      ];
      this.stats[catalog] = {};
      this.jobData[catalog] = {};

      prs.forEach(pr => {
        // Get begin and end the process
        const starttime = this.firstProcess(catalog, pr);
        const endtime = this.lastProcess(catalog, pr);

        // Get all jobs for the process
        const catalogJobs = this.jobs.filter(
          job => job.catalogue === catalog && job.name.toLowerCase() === pr
        );

        const warningJobs = catalogJobs.filter(job => job.warnings > 0);
        const errorJobs = catalogJobs.filter(job => job.errors > 0);
        const infoOnlyJobs = catalogJobs.filter(
          job => job.errors <= 0 && job.warnings <= 0
        );
        this.jobData[catalog][pr] = [
          ["Job klasse", "Aantal"],
          ["Jobs zonder meldingen", infoOnlyJobs.length],
          ["Jobs met waarschuwingen", warningJobs.length],
          ["Jobs met fouten", errorJobs.length]
        ];

        let infos = catalogJobs.reduce((infos, job) => infos + job.infos, 0);
        let errors = catalogJobs.reduce(
          (errors, job) => errors + job.errors,
          0
        );
        let warnings = catalogJobs.reduce(
          (warnings, job) => warnings + job.warnings,
          0
        );
        this.stats[catalog][pr] = {
          infos,
          errors,
          warnings
        };

        const rowLabel = `${pr} ${moment(starttime).format(
          "DD-MM HH:mm"
        )} - ${moment(endtime).format("DD-MM HH:mm")}`;
        if (starttime && endtime) {
          this.timeData[catalog].push([pr, rowLabel, starttime, endtime]);
        }
      });
    });
  },
  destroyed() {},
  watch: {}
};
</script>
<style scoped>
.timechart {
  height: 500px;
}
a {
  color: black;
}
</style>
