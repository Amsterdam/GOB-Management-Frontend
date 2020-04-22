<template>
  <b-container v-if="selectedCatalog">
    <b-row>
      <b-col class="mb-5">
        <h2>{{ selectedCatalog }} jobs afgelopen week</h2>
        <div v-if="weekSummaryData && weekSummaryData[selectedCatalog]">
          <GChart
            :settings="{ packages: ['bar'] }"
            :data="weekSummaryData[selectedCatalog]"
            :options="weekSummaryChartOptions"
            :createChart="(el, google) => new google.charts.Bar(el)"
            :events="chartEvents"
            ref="weekSummaryChart"
            @ready="onChartReady"
          />
        </div>
        <div v-else-if="weekSummaryData">
          Geen data voor {{ selectedCatalog }}
        </div>
        <div v-else>
          Loading...
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { getJobsSummary } from "../services/gob";
import { defaultOrdering } from "../config/jobs";

export default {
  name: "JobsSummary",
  props: {
    selectedCatalog: String
  },
  data() {
    return {
      chartsLib: null,
      weekSummaryData: null,
      weekSummaryChartOptions: {},
      chartEvents: {
        select: () => {
          // On selection (click) of bar, redirect to Jobs overview
          const selection = this.$refs.weekSummaryChart.chartObject.getSelection();

          if (selection.length) {
            let date = this.weekSummaryData[this.selectedCatalog][
              selection[0].row + 1
            ][0];
            let job = this.weekSummaryData[this.selectedCatalog][0][
              selection[0].column
            ];
            let [day, month] = date.split("-");

            this.$router.push({
              name: "jobs",
              query: {
                catalogue: this.selectedCatalog,
                year: new Date().getFullYear(),
                day: day,
                month: month,
                name: job
              }
            });
          }
        }
      }
    };
  },
  methods: {
    onChartReady(chart, google) {
      this.chartsLib = google;
      this.updateWeeklySummaryGraphOptions(
        this.selectedCatalog,
        this.weekSummaryData
      );
    },

    async loadWeeklySummary() {
      const ordering = defaultOrdering;
      let summary = await getJobsSummary();
      this.weekSummaryData = {};

      // Transform to format understood by GChart library
      for (let [catalog, summaryData] of Object.entries(summary)) {
        let catalogData = [];

        // Create first row (['', prepare, prepare_errors, import, import_errors ...])
        let firstKey = Object.keys(summaryData)[0];
        let firstRow = new Array(Object.keys(summaryData[firstKey]).length);
        firstRow[0] = "";
        catalogData.push(firstRow);

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

        this.weekSummaryData[catalog] = catalogData;
      }
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
    this.loadWeeklySummary();
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
  }
};
</script>

<style scoped></style>
