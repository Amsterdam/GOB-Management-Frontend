<template>
  <div class="mb-5" v-if="locks || queries">
    <h3>DB Info</h3>
    <div>
      <div v-if="locks">
        <h4>Locks: {{ locks.length }}</h4>
      </div>
      <div v-if="queries">
        <h4>Queries: {{ queries.length }}</h4>
        <div v-for="(query, index) in queries" :key="index">
          {{ query.concat }} ({{ query.duration_minutes }} minutes)
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { get_db_locks, get_db_queries } from "../services/gob_api";

export default {
  name: "DbInfo",
  data() {
    return {
      locks: null,
      queries: null,
      interval: null
    };
  },
  methods: {
    async get_locks() {
      this.locks = await get_db_locks();
    },

    async get_queries() {
      this.queries = await get_db_queries();
    },

    async update() {
      this.get_locks();
      this.get_queries();
    }
  },
  async mounted() {
    this.update();
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

<style scoped></style>
