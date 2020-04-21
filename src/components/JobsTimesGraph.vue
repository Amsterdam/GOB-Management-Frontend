<template>
  <b-container v-if="selectedCatalog">
    <b-row>
      <b-col class="mb-5">
        <div>
          <h2>Gemiddelde doorlooptijden</h2>
        </div>
        <div v-if="chartData && chartData[selectedCatalog]">
          <b-row>
            <b-col>
              <GChart
                :settings="{ packages: ['line'] }"
                :createChart="(el, google) => new google.charts.Line(el)"
                :data="chartData[selectedCatalog][brutoNetto]"
                :options="chartOptions"
                @ready="onChartReady"
              />
            </b-col>
          </b-row>
          <b-row class="mt-3">
            <b-col>
              <b-form-radio-group
                class="float-left"
                v-model="brutoNetto"
                @change="onChangeBrutoNetto"
                :options="radioOptions"
              >
              </b-form-radio-group>
            </b-col>
          </b-row>
        </div>
        <div v-else-if="chartData">Geen data voor {{ selectedCatalog }}</div>
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
  name: "JobsTimesGraph",
  props: {
    selectedCatalog: String
  },
  data() {
    return {
      chartsLib: null,
      brutoNetto: "bruto",
      radioOptions: [
        { text: "Bruto tijden", value: "bruto" },
        { text: "Netto tijden", value: "netto" }
      ],
      chartData: {},
      chartOptions: {
        axes: {
          y: {
            0: {
              label: "Doorlooptijd (min)"
            }
          }
        }
      }
    };
  },
  methods: {
    onChangeBrutoNetto(brutoNetto) {
      this.brutoNetto = brutoNetto;
    },
    onChartReady(chart, google) {
      this.chartsLib = google;
    },

    /**
     * Load jobs summary and sets chartData.
     *
     * this.chartData = {
     *     bag: {
     *         netto: [
     *             ['date', 'import', 'export' ....],
     *             ['14-4', a, b, ....],
     *             ['15-4', c, d, ....],
     *             ...
     *         ],
     *         bruto: [
     *             ...
     *         ]
     *     },
     *     brk: {...},
     *     ...
     * }
     *
     * where a, b, c and d are the average running times for each job on each date in minutes
     */
    async loadData() {
      let ordering = defaultOrdering;
      let summary = await getJobsSummary();

      function firstEntry(obj) {
        // Return first entry in object.
        let keys = Object.keys(obj);
        return keys.length ? obj[keys[0]] : null;
      }

      let jobTypes = Object.keys(firstEntry(firstEntry(summary))).filter(
        t => ordering.indexOf(t) > -1
      );

      let firstRow = new Array(jobTypes.length + 1);

      firstRow[0] = "";
      for (let jobType of jobTypes) {
        // Index according to ordering. Skip unknown job types.

        firstRow[ordering.indexOf(jobType) + 1] = jobType;
      }

      this.chartData = {};
      for (let [catalog, summaryData] of Object.entries(summary)) {
        let catalogData = {
          bruto: [[...firstRow]],
          netto: [[...firstRow]]
        };

        for (let [date, jobs] of Object.entries(summaryData)) {
          let nettoRow = new Array(firstRow.length);
          let brutoRow = new Array(firstRow.length);
          nettoRow[0] = brutoRow[0] = date;

          for (let [name, job] of Object.entries(jobs)) {
            let idx = firstRow.indexOf(name);

            if (idx !== -1) {
              nettoRow[idx] = job.jobs.length
                ? job.netto_total / 60 / job.jobs.length
                : 0;
              brutoRow[idx] = job.jobs.length
                ? job.bruto_total / 60 / job.jobs.length
                : 0;
            }
          }
          catalogData.bruto.push(brutoRow);
          catalogData.netto.push(nettoRow);
        }

        this.chartData[catalog] = catalogData;
      }
    }
  },
  async mounted() {
    this.loadData();
  }
};
</script>

<style scoped></style>
