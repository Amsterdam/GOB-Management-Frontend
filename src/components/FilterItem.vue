<template>
  <div>
    <div class="text-left">
      <b-btn block v-b-toggle="title" variant="primary" class="mb-2">
        {{ title }}
        <span class="when-closed float-right">
          <font-awesome-icon icon="chevron-down" />
        </span>
        <span class="when-opened float-right">
          <font-awesome-icon icon="chevron-up" />
        </span>
      </b-btn>
    </div>
    <b-collapse :id="title" class="text-left">
      <slot></slot>
    </b-collapse>
  </div>
</template>

<script>
export default {
  name: "FilterItem",
  props: {
    title: String
  }
};
</script>

<style scoped>
.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
  display: none;
}
</style>
