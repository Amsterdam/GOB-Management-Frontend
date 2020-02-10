<template>
  <div>
    <h3>DB Info</h3>
    <div>
      <h4>Locks</h4>
      <div>{{ locks }}</div>
      <h4>Queries</h4>
      <div>{{ queries }}</div>
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
      queries: null
    };
  },
  methods: {
    async get_locks() {
      this.locks = await get_db_locks();
    },

    async get_queries() {
      this.queries = await get_db_queries();
    }
  },
  mounted() {
    this.get_locks();
    this.get_queries();
  },
  watch: {}
};
</script>

<style scoped></style>
