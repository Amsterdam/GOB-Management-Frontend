<template>
  <div>
    <div class="text-left">
      <b-btn
        pill
        block
        @click="is_visible = !is_visible"
        size="sm"
        variant="outline-dark"
        class="mb-2"
      >
        {{ title }}
        <span v-if="is_visible" class="float-right">
          <font-awesome-icon icon="chevron-up" />
        </span>
        <span v-else>
          <span v-if="whenClosed">({{ whenClosed }})</span>
          <span class="float-right">
            <font-awesome-icon icon="chevron-down" />
          </span>
        </span>
      </b-btn>
    </div>
    <b-collapse :visible="is_visible" class="text-left">
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
      is_visible: null
    };
  },
  mounted() {
    this.is_visible = this.visible;
  }
};
</script>

<style scoped></style>
