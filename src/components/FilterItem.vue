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
      >
        {{ title }}
        <span v-if="whenClosed" class="when-closed">({{ whenClosed }})</span>
        <span class="when-closed float-right">
          <font-awesome-icon icon="chevron-down" />
        </span>
        <span class="when-opened float-right">
          <font-awesome-icon icon="chevron-up" />
        </span>
      </b-btn>
    </div>
    <b-collapse :visible="visible" :id="title + id" class="text-left">
      <slot></slot>
    </b-collapse>
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

<style scoped>
.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
  display: none;
}
</style>
