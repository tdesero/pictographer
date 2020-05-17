<template>
  <div @mouseup="endPointMove">
    <svg 
      @mousedown="handleMouseDown" 
      @mousemove="handleMouseMove" 
      class="v_app-canvas absolute-center shadow" stroke="black" viewBox="0 0 100 100">
      <SvgPath v-for="(path, index) in store.state.allPaths" :definition="path.definition" :path="path" :key="path.id" :id="path.id" :index="index" :ref="path.id"></SvgPath>

      <g v-for="path in store.state.allPaths" :key="'g-' + path.id" :class="{active: path.id === store.state.selectedPathId}" :transform="transform(path)">
        <!-- dest points -->
        <circle 
          v-for="segment in path.definition" 
          @mousedown="startPointMove(segment.id, 'dest')"
          :cx="segment.dest.x" 
          :cy="segment.dest.y" 
          r="2" 
          :key="segment.id"
          ></circle>
      </g>
      <path 
        v-if="store.state.tool === 'PEN'"
        :d="livePreview" 
        stroke="blue" 
        :transform="transform(store.state.allPaths[store.state.selectedPathIndex])"
        ></path>
    </svg>
  </div>
</template>

<script>
import store from "../store/store";
import SvgPath from "./SvgPath";

export default {
  name: "MainCanvas",
  data: function() {
    return {
      store
    };
  },
  components: {
    SvgPath
  },
  computed: {
    livePreview: function() {
      const {currentPoint, livePreviewSegment} = this.store.state;
      let d = ''
      if (livePreviewSegment.dest) {
          d = ['M', currentPoint.x, currentPoint.y, livePreviewSegment.type, livePreviewSegment.dest.x, livePreviewSegment.dest.y].join(' ');
      }
      return d;
    }
  },
  methods: {
    handleMouseDown: function(event) {
      let pathId = this.store.state.selectedPathId;
      this.store.handleMouseDown(event, this.$refs[pathId][0].$el);
    },
    handleMouseMove: function(event) {
      let pathId = this.store.state.selectedPathId;
      this.store.handleMouseMove(event, this.$refs[pathId][0].$el);
    },
    transform: function(path) {
      let t = '';
      if(path.rotation) {
        t += 'rotate(' + path.rotation + ')';
      }
      return t;
    },
    startPointMove: function(id, step) {
      this.store.setSelectedPoint(id, step)
    },
    endPointMove: function() {
      this.store.handleMouseUp()
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.v_app-canvas {
  background-color: #FFF;
  height: 100%;
  width: 100%;
  max-height: 500px;
  max-width: 500px;
}

g.active {
  fill: blue;
}

</style>
