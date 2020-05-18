<template>
  <div class="v_left-panel absolute-y-center p-5 text-center">
    <button
      @click="newPath"
      class="btn btn-primary btn btn-primary btn-circle btn-xl"
    >new</button>
    <button
      @click="store.selectTool('PEN')"
      class="btn btn-primary btn btn-primary btn-circle btn-xl"
    >Pen</button>
    <button
      @click="store.selectTool('SELECT')"
      class="btn btn-primary btn btn-primary btn-circle btn-xl"
    >select</button>

    <button
      @click="store.deleteSegment()"
      class="btn btn-primary btn btn-primary btn-circle btn-xl"
    >delPoint</button>
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
}
</style>
