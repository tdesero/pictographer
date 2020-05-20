<template>
  <path class="edit-path" :class="{active: isActive}" :d="dToString" fill="none" @click="handleClick" :transform="transform" ref="path"></path>
</template>

<script>
import store from "../store/store";

export default {
  name: "EditPath",
  props: {
    scaleX: Number, // to scale controls to the full canvas
    scaleY: Number, // to scale controls to the full canvas
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
      const { scaleX, scaleY } = this;
      this.definition.forEach(s => {
        d += [s.type, 
              s.curve1.x ? s.curve1.x * scaleX : '', 
              s.curve1.y ? s.curve1.y * scaleY : '', 
              s.curve2.x ? s.curve2.x * scaleX : '', 
              s.curve2.y ? s.curve2.y * scaleY : '', 
              s.dest.x ? s.dest.x * scaleX : '', 
              s.dest.y ? s.dest.y * scaleY : ''].join(' ');
      });
      return d;
    },
    isActive: function() {
      return this.store.state.selectedPathId === this.id;
    },
    transform: function() {
      let t = '';
      const {scaleX, scaleY} = this;
      if(this.path.rotation) {
        t += `rotate(${this.path.rotation} ${this.path.rotationCenter.x * scaleX} ${this.path.rotationCenter.y * scaleY})`;
      }
      return t;
    }
  },
  methods: {
    handleClick: function() {
      this.store.selectPath(this.id, this.index);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.edit-path.active {
  stroke: #363bd2;
  stroke-width: 2px;
  opacity: 1;
}

.edit-path {
  stroke: #363bd2;
  stroke-width: 10px;
  opacity: 0;
}
</style>
