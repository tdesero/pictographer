<template>
  <div>tbd right panel
    <div v-if="store.state.selectedPathIndex != null">
      rotation
      <input v-model.number="rotate" type="number">
      snap to grid
      <input v-model="store.state.snapToGrid" type="checkbox">
      hide controls
      <input v-model="store.state.hideControls" type="checkbox">
    </div>
  </div>
</template>

<script>
import store from "../store/store";

export default {
  name: "RightPanel",
  data: function() {
    return {
      store
    }
  },
  computed: {
    rotate: {
      get() {
        return this.store.state.allPaths[store.state.selectedPathIndex].rotation;
      },
      set(val) {
        this.store.updateRotation(val)
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
