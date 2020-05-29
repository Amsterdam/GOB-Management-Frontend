<template>
  <div>
    <div class="text-left">
      <b-btn
        pill
        block
        v-b-toggle="title + id"
        size="sm"
        variant="outline-dark"
        class="mb-2"
        >{{ title }}</b-btn
      >
      <b-collapse :id="title + id" :visible="visible" class="mt-2">
        <slot></slot>
      </b-collapse>
    </div>
  </div>
</template>

<script>
export default {
  name: "FilterItem",
  props: {
    title: String,
    whenClosed: String,
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      id: ""
    };
  },
  mounted() {
    this.id = Math.random()
      .toString()
      .substring(1);
  }
};
</script>

<style scoped></style>
