<template>
  <div class="jobstart">
    <b-form-input
      class="mb-2"
      v-if="action === 'Export'"
      v-model="product"
      placeholder="Optionally enter the name of the export file"
    ></b-form-input>
    <b-form-input
      class="mb-2"
      v-if="action === 'Relate'"
      v-model="product"
      placeholder="Optionally enter the name of an attribute"
    ></b-form-input>
    <b-button :disabled="!canStart()" @click="start()"
      ><font-awesome-icon icon="play" class="error" />
      {{ title }}
      {{ action }}
      {{ product }}</b-button
    >
    <div v-for="result in results" :key="result.text">
      <div class="mt-2" v-if="result" :class="result.ok ? 'INFO' : 'ERROR'">
        {{ result.text }}
      </div>
    </div>
  </div>
</template>

<script>
import {
  createJob,
  catalogOnlyJobs,
  collectionOptionalJobs
} from "../services/gob";
import auth from "../services/auth";

export default {
  name: "JobStart",
  props: {
    title: String,
    action: String,
    catalog: String,
    collection: null
  },
  data() {
    return {
      results: [],
      product: null
    };
  },
  methods: {
    canStart() {
      const action = this.action && this.action.toLowerCase();
      return (
        !this.results.length &&
        action &&
        (catalogOnlyJobs.includes(action) ||
          collectionOptionalJobs.includes(action) ||
          (this.catalog && this.collection && this.collection.length))
      );
    },
    async start() {
      this.results = [];

      let user = "onbekende gebruiker";
      const userInfo = await auth.userInfo();
      if (userInfo) {
        user = userInfo.preferred_username;
      }
      user = `${user} (Iris)`;

      let collections = this.collection || [];
      if (!Array.isArray(collections)) {
        collections = [collections];
      }

      if (!collections.length) {
        collections = [null];
      }
      for (let collection of collections) {
        let result = await createJob(
          this.action,
          this.catalog,
          collection,
          this.product,
          user
        );

        if (result.ok) {
          const info = JSON.parse(result.text);
          const values = Object.values(info).join(" ");
          result.text = `${this.action} ${values} started`;
        } else {
          result.text = `${this.action} ${this.catalog} {collection} failed`;
        }
        this.results.push(result);
        this.$forceUpdate();
      }
    },
    clearResult() {
      this.results = [];
      this.product = null;
    }
  },
  watch: {
    action() {
      this.clearResult();
    },
    catalog() {
      this.clearResult();
    },
    collection() {
      this.clearResult();
    }
  }
};
</script>

<style scoped>
.jobstart {
  text-align: center !important;
}
</style>
