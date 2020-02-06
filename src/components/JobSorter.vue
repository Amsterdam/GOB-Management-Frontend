<template>
  <div>
    <b-button v-b-toggle.sortering block variant="primary">Sortering</b-button>
    <b-collapse id="sortering" v-if="job">
      <div class="mt-2">
        <b-button size="sm" @click="sort.direction *= -1">
          {{ sort.direction > 0 ? "Oplopend" : "Aflopend" }}
        </b-button>
      </div>
      <b-form-group class="text-left">
        <b-form-radio-group
          class="mt-2"
          stacked
          v-model="sort.field"
          name="flavour2a"
          :options="Object.keys(job)"
        />
      </b-form-group>
    </b-collapse>
  </div>
</template>

<script>
export default {
  name: "JobSorter",
  props: {
    job: Object,
    sort: Object
  }
};
</script>
