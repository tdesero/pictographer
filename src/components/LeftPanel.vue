<template>
  <div class="v_left-panel absolute-y-center p-5 text-center">

    <button
      @click="store.selectTool('EDIT')"
      class="btn btn-primary btn btn-primary btn-circle btn-xl"
      title="Edit"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path data-v-076a7a29="" data-v-306af221="" d="M     5 5L     5 5L     14 25L     16 16L     25 13Z      " fill="none" transform="" stroke-linecap="butt" stroke-width="2"></path></svg>
    </button>

    <button
      @click="store.selectTool('SELECT')"
      class="btn btn-primary btn btn-primary btn-circle btn-xl"
      title="Select"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M 19 10 L 19 4 L 4 4 L 4 19 L 10 19 M 11 11 L 15 21 L 17 17 L 21 15 Z M 2 17 L 2 21 L 6 21 L 6 17 Z M 6 2 L 6 6 L 2 6 L 2 2 Z M 17 2 L 21 2 L 21 6 L 17 6 Z" stroke-width="2"></path></svg>
    </button>

    <button
      @click="store.selectTool('PEN')"
      class="btn btn-primary btn btn-primary btn-circle btn-xl"
      title="Pen"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M 19 2 L 13 8 L 10 6 L 4 13 L 2 22 L 12 20 L 18 14 L 16 11 L 22 5 L 19 2 Z M 2 22 L 9 15 M 16 5 L 19 8 " stroke-width="2"></path></svg>
    
    </button>

    <button
      @click="newPath"
      class="btn btn-primary btn btn-primary btn-circle btn-xl"
      title="New"
    >+</button>

    <button
      @click="store.deleteAction()"
      title="Delete"
      class="btn btn-primary btn btn-primary btn-circle btn-xl"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M 4 4 L 4 8 L 20 8 L 20 3 L 4 3 Z M 6 8 L 6 21 L 18 21 L 18 8 M 10 9 L 10 20 M 14 9 L 14 21 " stroke-width="2"></path></svg>
    </button>

  </div>
</template>

<script>
import store from "../store/store";

export default {
  name: "LeftPanel",
  data: function() {
    return {
      store
    };
  },
  methods: {
    newPath: function() {
      this.store.createPath();
      this.store.selectTool('PEN');
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.v_left-panel {
  max-width: 5rem;
  max-width: 5rem;
  z-index: 9;
  pointer-events: none;
}

.btn {
  margin-bottom: 1rem;
  pointer-events: auto;
}
</style>
