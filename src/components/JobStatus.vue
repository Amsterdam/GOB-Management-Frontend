<template>
  <span>
    <span
      v-if="job.status === 'scheduled'"
      title="Job (of onderdeel daarvan) wacht om uitgevoerd te worden"
    >
      <font-awesome-icon icon="clock" />
    </span>
    <span v-if="job.status === 'zombie'" title="Job duurt langer dan 12 uur">
      {{ job.step }}
      <img src="../assets/zombie.gif" height="20px" />
    </span>
    <span v-if="job.status === 'started'" title="Job wordt uitgevoerd">
      {{ job.step }}
      <img src="../assets/running.gif" height="20px" />
    </span>
    <span v-if="job.status === 'rejected'" title="Job is geweigerd">
      {{ job.status }}
      <img src="../assets/rejected.gif" height="20px" />
    </span>
    <span v-if="job.status === 'ended'">
      <span v-if="job.endtime || job.end" title="Job is geëindigd">
        <font-awesome-icon icon="flag-checkered" />
      </span>
      <span
        v-else
        title="Job loopt nog terwijl er geen taken gepland staan om de job af te ronden"
      >
        <font-awesome-icon icon="wrench" class="error" />
      </span>
    </span>
    <span v-if="job.status === 'failed'" title="Job is gecrashed">
      <font-awesome-icon icon="car-crash" class="error" />
    </span>
  </span>
</template>

<script>
export default {
  props: {
    job: Object
  }
};
</script>

<style lang="scss" coped>
@import "../scss/app";
.error {
  color: $danger;
}
</style>
