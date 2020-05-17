<template>
  <div>tbd right panel
    <div v-if="store.state.selectedPathIndex">
      <input @change="rotate" :value="getRotation">
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
    };
  },
  methods: {
    rotate: function(event) {
      if (!this.store.state.selectedPathIndex) return;
      this.store.state.allPaths[this.store.state.selectedPathIndex].rotation = event.target.value;
    }
  }
  ,
  computed: {
    getRotation: function() {
      if (!this.store.state.selectedPathIndex) return;
      return this.store.state.allPaths[this.store.state.selectedPathIndex].rotation || 0;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
