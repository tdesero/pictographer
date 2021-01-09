<template>
  <path class="edit-path" :class="{active: isActive, 'select-tool': store.state.tool === 'SELECT' }" :d="dToString" :fill="path.hasFill ? 'currentColor' : 'none'" @mousedown="(event) => handleMouseDown(id, index, event)" :transform="transform" ref="path"></path>
</template>

<script>
import store from "../store/store";

export default {
  name: "EditPath",
  props: {
    scaleX: Number, // to scale controls to the full canvas
    scaleY: Number, // to scale controls to the full canvas
    definition: Array,
    id: String,
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
              s.curve1.x !== undefined ? s.curve1.x * scaleX : '', 
              s.curve1.y !== undefined ? s.curve1.y * scaleY : '', 
              s.curve2.x !== undefined ? s.curve2.x * scaleX : '', 
              s.curve2.y !== undefined ? s.curve2.y * scaleY : '', 
              s.dest.x !== undefined ? s.dest.x * scaleX : '', 
              s.dest.y !== undefined ? s.dest.y * scaleY : ''].join(' ');
      });
      return d;
    },
    isActive: function() {
      const { selectedPathId, tool } = this.store.state;
      return (tool === 'EDIT' || tool === 'PEN' || tool === 'RECT') && selectedPathId === this.id;
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
    handleMouseDown: function(id, index, event) {
      let selectedPathId = this.store.state.selectedPathId;
      if (this.id !== selectedPathId) {
        this.store.selectPath(this.id, index, event);
        selectedPathId = this.store.state.selectedPathId; // has to be updatet the id is only a value not reference
      } 
      if (this.store.state.tool === 'SELECT' && selectedPathId === id ) {
        this.store.state.isMovingPath = true;
      }
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
  stroke-width: 20px;
  opacity: 0;
  color: #000;
}

.select-tool {
  cursor: move;
}
</style>
