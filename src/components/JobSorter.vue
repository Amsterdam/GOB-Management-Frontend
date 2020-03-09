<template>
  <div>
    <filter-item title="Sortering" :when-closed="sort.field">
      <div v-if="job">
        <div class="text-center">
          <b-btn
            class="text-left"
            pill
            size="sm"
            variant="secondary"
            @click="sort.direction *= -1"
          >
            <span v-if="sort.direction > 0">
              Oplopend
              <font-awesome-icon
                icon="sort-amount-down-alt"
              ></font-awesome-icon>
            </span>
            <span v-else>
              Aflopend
              <font-awesome-icon icon="sort-amount-down"></font-awesome-icon>
            </span>
          </b-btn>
        </div>
        <b-form-group class="text-left mb-2">
          <b-form-radio v-model="sort.field" name="nosort" value="">
            unsorted
          </b-form-radio>
          <b-form-radio-group
            stacked
            v-model="sort.field"
            name="flavour2a"
            :options="Object.keys(job)"
          />
        </b-form-group>
      </div>
    </filter-item>
  </div>
</template>

<script>
import FilterItem from "./FilterItem";
export default {
  name: "JobSorter",
  components: { FilterItem },
  props: {
    job: Object,
    sort: Object
  }
};
</script>
