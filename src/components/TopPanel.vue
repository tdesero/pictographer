<template>
  <div>tbd top panel
    <button @click="historyUndo">undo</button>
    <button @click="historyRedo">redo</button>
  </div>
</template>

<script>
import store from "../store/store";

export default {
  name: "TopPanel",
  data: function() {
    return {
      store
    }
  },
  methods: {
    historyUndo() {
      if (this.store.state.historyPos === this.store.state.history.length - 1) return;
      this.store.setHistoryPos(1);
      this.store.historyGoTo(this.store.state.historyPos);
    },
    historyRedo() {
      if (this.store.state.historyPos === -1 ) return;
      this.store.setHistoryPos(-1);
      this.store.historyGoTo(this.store.state.historyPos);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
