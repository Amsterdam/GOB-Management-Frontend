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
    <div v-if="weekSummaryData && selectedCatalog">
      <b-row>
        <b-col>
          <h2>{{ selectedCatalog }} jobs afgelopen week</h2>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <GChart
            :settings="{ packages: ['bar'] }"
            :data="weekSummaryData[selectedCatalog]"
            :options="weekSummaryChartOptions"
            :createChart="(el, google) => new google.charts.Bar(el)"
            @ready="onChartReady"
          />
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import { GChart } from "vue-google-charts";

import { getJobs, catalogues, getWeeklySummary } from "../services/gob";

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
      chartsLib: null,
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
      PROCESSES,
      weekSummaryData: null,
      weekSummaryChartOptions: {}
    };
  },
  watch: {
    selectedCatalog: function(selectedCatalog) {
      this.updateWeeklySummaryGraphOptions(
        selectedCatalog,
        this.weekSummaryData
      );
    },
    weekSummaryData: function(weekSummaryData) {
      this.updateWeeklySummaryGraphOptions(
        this.selectedCatalog,
        weekSummaryData
      );
    }
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
    },

    onChartReady(chart, google) {
      this.chartsLib = google;
      this.updateWeeklySummaryGraphOptions(
        this.selectedCatalog,
        this.weekSummaryData
      );
    },

    async loadWeeklySummary() {
      const ordering = [
        "prepare",
        "import",
        "relate",
        "export",
        "export_test",
        "dump",
        "data_consistency_test"
      ];
      let summary = await getWeeklySummary();
      this.weekSummaryData = {};

      // Transform to format understood by GChart library
      for (let [catalog, summaryData] of Object.entries(summary)) {
        let catalogData = [];

        // Create first row (['', prepare, prepare_errors, import, import_errors ...])
        let firstKey = Object.keys(summaryData)[0];
        let firstRow = new Array(Object.keys(summaryData[firstKey]).length);
        firstRow[0] = "";

        for (let key of Object.keys(summaryData[firstKey])) {
          let processIdx = ordering.indexOf(key);
          if (processIdx === -1) continue;

          firstRow[processIdx * 2 + 1] = key;
          firstRow[processIdx * 2 + 2] = key + " with errors";
        }

        // Fill data ([date, prepare_job_success_cnt, prepare_job_error_cnt, import_job_cnt, import_job_error_cnt, ... ])
        for (let [date, jobs] of Object.entries(summaryData)) {
          let row = new Array(firstRow.length);
          row[0] = date;
          for (let [job, result] of Object.entries(jobs)) {
            let idx = firstRow.indexOf(job);
            if (idx === -1) continue;

            row[idx] = result.total_jobs - result.with_errors;
            row[idx + 1] = result.with_errors;
          }
          catalogData.push(row);
        }

        // Sort dates, remove possibly incomplete first day and prepend firstRow (header)
        catalogData.sort((a, b) => (a[0] > b[0] ? 1 : -1));
        catalogData = catalogData.slice(1);
        catalogData.unshift(firstRow);

        this.weekSummaryData[catalog] = catalogData;
      }
    },

    async loadPieCharts() {
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

    updateWeeklySummaryGraphOptions(selectedCatalog, weekSummaryData) {
      if (
        !this.chartsLib ||
        !weekSummaryData ||
        !weekSummaryData[selectedCatalog]
      )
        return;
      let selectedData = weekSummaryData[selectedCatalog];

      // Get maximum value, ignore first row and first column of each row.
      let max = Math.max(
        ...selectedData.slice(1).map(l => Math.max(...l.slice(1)))
      );

      let viewWindow = {
        max: max,
        min: 0
      };
      let defaultVAxis = {
        viewWindow: viewWindow,
        gridlines: {
          color: "transparent"
        },
        textStyle: {
          color: "transparent"
        }
      };

      // Have group name plus 2 entries per axis
      let axisCnt = (selectedData[0].length - 1) / 2;

      let series = {};
      let vAxes = {
        0: {
          viewWindow: viewWindow
        }
      };

      for (let i = 0; i < axisCnt; i++) {
        vAxes[i * 2 + 1] = defaultVAxis;
        vAxes[i * 2 + 2] = defaultVAxis;

        series[i * 2] = {
          color: "green",
          targetAxisIndex: i
        };
        series[i * 2 + 1] = {
          color: "red",
          targetAxisIndex: i,
          visibleInLegend: false
        };
      }

      this.weekSummaryChartOptions = this.chartsLib.charts.Bar.convertOptions({
        isStacked: true,
        colors: ["green"],
        legend: {
          position: "none"
        },
        vAxes: vAxes,
        series: series
      });
    }
  },

  async mounted() {
    // Load pie charts and weekly summary in parallel
    await Promise.all([this.loadPieCharts(), this.loadWeeklySummary()]);
  },
  destroyed() {}
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
