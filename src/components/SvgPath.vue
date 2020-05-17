<template>
  <path :class="{active: isActive}" :d="dToString" fill="none" @click="handleClick" :transform="transform" ref="path"></path>
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
        d += [s.type, s.dest.x, s.dest.y].join(' ');
      });
      return d;
    },
    isActive: function() {
      return this.store.state.selectedPathId === this.id;
    },
    transform: function() {
      let t = '';
      if(this.path.rotation) {
        t += `rotate(${this.path.rotation} ${this.path.rotationCenter.x} ${this.path.rotationCenter.y})`;
      }
      return t;
    }
  },
  methods: {
    handleClick: function() {
      this.store.selectPath(this.id, this.index)
      
    }
  },
  beforeUpdate: function() {
    this.store.updatePathCenter(this.$refs.path.getBBox())
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.active {
  stroke:green;
}
</style>
