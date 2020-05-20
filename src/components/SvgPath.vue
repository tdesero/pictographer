<template>
  <path 
    :class="{active: isActive}" 
    :d="dToString" 
    fill="none" 
    @click="handleClick" 
    :transform="transform" 
    :stroke-linecap="path.strokeLinecap"
    :stroke-linejoin="path.strokeLinejoin"
    :stroke-width="path.strokeWidth"
    ref="path"
    ></path>
</template>

<script>
import store from "../store/store";

export default {
  name: "SvgPath",
  props: {
    definition: Array,
    id: Number,
    index: Number,
    path: Object
  },
  data: function() {
    return {
      store
      };
  },
  computed: {
    dToString: function() {
      let d = "";
      this.definition.forEach(s => {
        d += [s.type, s.curve1.x, s.curve1.y, s.curve2.x, s.curve2.y, s.dest.x, s.dest.y].join(' ');
      });
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
    }
  },
  methods: {
    handleClick: function() {
      this.store.selectPath(this.id, this.index);
    }
  },
  beforeUpdate: function() {
    if ( this.isActive ) {
      this.store.updatePathCenter(this.$refs.path.getBBox())
    }
  },
  updated: function() {
    const { selectedPathId } = this.store.state;

    if (this.id === selectedPathId && !(window.SELECTED_PATH === this.$refs.path)) {
      window.SELECTED_PATH = this.$refs.path;
    }
  },
  created: function() {
    const { selectedPathId } = this.store.state;

    if (this.id === selectedPathId && !(window.SELECTED_PATH === this.$refs.path)) {
      window.SELECTED_PATH = this.$refs.path;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
