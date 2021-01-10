<template>
    <path 
      class="svg-path"
      :class="{active: isActive}" 
      :d="dToString"  
      :transform="transform" 
      :stroke-linecap="path.strokeLinecap"
      :stroke-linejoin="path.strokeLinejoin"
      :stroke-width="path.strokeWidth"
      :fill="path.hasFill ? 'currentColor' : 'none'"
      :id="id"
      ref="path"
      ></path>
</template>

<script>
import store from "../store/store";

export default {
  name: "SvgPath",
  props: {
    definition: Array,
    id: String,
    index: Number,
    path: Object
  },
  data: function() {
    return {
      store,
      parentReference: {}
      };
  },
  computed: {
    dToString: function() {
      let d = "";
      this.definition.forEach(s => {
        d += [s.type, s.curve1.x, s.curve1.y, s.curve2.x, s.curve2.y, s.dest.x, s.dest.y].join(' ');
      });
      if (this.path.isClosed) {
        d += " Z";
      }
      return d;
    },
    isActive: function() {
      return this.store.state.selectedPathId === this.id;
    },
    transform: function() {
      let t = '';
      if (this.path.rotation) {
        t += `rotate(${this.path.rotation} ${this.path.rotationCenter.x} ${this.path.rotationCenter.y}) `;
      }
      return t;
    },
  },
  mounted: function() {
    this.parentReference = this.$refs.path.parentElement;
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.svg-path {
  color: black;
}
</style>
