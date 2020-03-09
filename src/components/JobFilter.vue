<template>
  <div>
    <div class="text-left font-weight-bold">
      Shortcuts
    </div>
    <b-form-group class="text-left">
      <b-form-group>
        <div class="mb-1">
          <b-btn block variant="primary" @click="filterOnFailed()"
            >Jobs gefaald</b-btn
          >
        </div>
        <div class="mb-1">
          <b-btn block variant="primary" @click="filterOnErrors()"
            >Jobs met fouten</b-btn
          >
        </div>
        <div class="mb-1">
          <b-btn block variant="primary" @click="filterOnWarnings()"
            >Jobs met waarschuwingen</b-btn
          >
        </div>
        <div>
          <b-btn block variant="primary" @click="clearFilter()"
            >Reset filters</b-btn
          >
        </div>
      </b-form-group>
    </b-form-group>
    <div class="text-left font-weight-bold">
      Filters
    </div>
    <filter-item title="Type meldingen" :visible="true">
      <b-form-group>
        <b-form-checkbox-group
          stacked
          v-model="filter.messageTypes"
          name="flavour2a"
          :options="messageTypes"
        />
      </b-form-group>
    </filter-item>
    <div
      v-for="filterType in filterTypes"
      :key="filterType.key"
      v-if="filterOptions(filterType.key).length"
    >
      <filter-item
        :title="filterType.text"
        :visible="filterOptions(filterType.key).length <= 5"
      >
        <b-form-group>
          <b-form-checkbox-group
            stacked
            v-model="filter[filterType.key]"
            name="flavour2a"
            :options="filterOptions(filterType.key)"
          />
        </b-form-group>
      </filter-item>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import FilterItem from "./FilterItem";

export default {
  components: { FilterItem },
  props: {
    filter: Object,
    jobs: Array
  },
  methods: {
    clearFilter() {
      Object.keys(this.filter).map(key => {
        this.filter[key] = [];
      });
    },
    filterOnFailed() {
      this.clearFilter();
      this.filter.ageCategory = [" 0 - 24 uur"];
      this.filter.status = ["zombie", "failed"];
    },
    filterOnErrors() {
      this.clearFilter();
      this.filter.ageCategory = [" 0 - 24 uur"];
      this.filter.messageTypes = ["errors"];
    },
    filterOnWarnings() {
      this.clearFilter();
      this.filter.ageCategory = [" 0 - 24 uur"];
      this.filter.messageTypes = ["warnings"];
    },
    filterOptions(key) {
      return _.uniq(
        this.jobs
          // Filter out relation entities
          .filter(job => (key === "entity" ? job.catalogue !== "rel" : true))
          .map(job => job[key])
          .concat(this.filter[key])
          .filter(k => k)
          .map(k => k.toLowerCase())
          .map(k => k.replace(/_/g, " "))
          .sort()
      );
    }
  },
  data() {
    return {
      filterTypes: [
        { text: "Status", key: "status" },
        { text: "Leeftijd", key: "ageCategory" },
        { text: "Type verwerking", key: "name" },
        { text: "Verwerking", key: "execution" },
        { text: "Bron", key: "source" },
        { text: "Applicatie", key: "application" },
        { text: "Registraties", key: "catalogue" },
        { text: "Entiteiten", key: "entity" },
        { text: "Attributen", key: "attribute" }
      ],
      messageTypes: [
        { text: "Info", value: "infos" },
        { text: "Warning", value: "warnings" },
        { text: "Error", value: "errors" }
      ]
    };
  }
};
</script>

<style>
.col-form-label {
  font-weight: bold !important;
}
</style>
