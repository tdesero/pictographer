<template>
  <div>tbd right panel
    <div v-if="store.state.selectedPathIndex != null">
      <input v-model.number="rotate" type="number">
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
        this.store.state.allPaths[store.state.selectedPathIndex].rotation = val;
        this.store.updateRotationCenter();
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
