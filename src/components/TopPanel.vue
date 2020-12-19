<template>
  <div class="app-top-panel p-1">
    <button class="btn btn-alt-gray-3 btn-sm mr-1 mb-0" @click="historyUndo">
      <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="currentColor"><path d="M 21 17 C 21 13 18 10 14 10 L 4 10 M 7 6 L 3 10 L 7 14 " stroke-width="2"></path></svg>
    </button>
    <button 
      :class="{ disabled: store.state.historyPos === -1 }"
      :disabled="store.state.historyPos === -1"
      class="btn btn-alt-gray-3 btn-primary btn-sm mb-0" @click="historyRedo"
    >
      <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="currentColor"><path d="M 21 17 C 21 13 18 10 14 10 L 4 10 M 7 6 L 3 10 L 7 14 " stroke-width="2" transform="scale(-1,1) translate(-24,0)"></path></svg>
    </button>

    <label class="mx-2">Width</label>
    <input v-model="store.state.viewBox.x" class="canvas-size-input form-input display-inline my-0 bg-gray-3 text-light border-0" type="number" />

    <label class="mx-2">Height</label>
    <input v-model="store.state.viewBox.y" class="canvas-size-input form-input display-inline my-0 bg-gray-3 text-light border-0" type="number" />

    <label class="mx-2">Zoom</label>
    <select v-model="store.state.zoom" 
        class="canvas-size-input form-input display-inline my-0 bg-gray-3 text-light border-0" 
        type="number"
    >
      <option value="0">auto</option>
      <option value="1">100%</option>
      <option value="2">200%</option>
      <option value="4">400%</option>
      <option value="10">1000%</option>
      <option value="20">2000%</option>
    </select>

    <div class="display-inline py-2 px-4">
      <div class="form-group display-inline ml-2">
        <label class="form-switch">
          <input v-model="store.state.snapToGrid" type="checkbox">
          <i class="switch"></i>
          <span>Snap to Grid</span>
        </label>
      </div>

      <div class="form-group display-inline ml-2">
        <label class="form-switch">
          <input v-model="store.state.hideControls" type="checkbox">
          <i class="switch"></i>
          <span>Hide Controls</span>
        </label>
      </div>
    </div>

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
.app-top-panel {
  position: relative;
  color: #EEE;
  background-color: #333;
  width: 100%;
}

.btn svg {
  display: inline;
}

button:disabled {
  cursor: not-allowed;
}

.canvas-size-input {
  width: 5rem;
}
</style>
