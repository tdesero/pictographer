<template>
  <div @mouseup="endPointMove">
    <svg 
      @mousedown="handleMouseDown" 
      @mousemove="handleMouseMove" 
      class="v_app-canvas absolute-center shadow" stroke="black" viewBox="0 0 24 24">
      <SvgPath v-for="(path, index) in store.state.allPaths" :definition="path.definition" :path="path" :key="path.id" :id="path.id" :index="index" :ref="path.id"></SvgPath>

      <g v-for="(path, index) in store.state.allPaths" :key="'g-' + path.id" :class="{active: path.id === store.state.selectedPathId}" :transform="transform(path)">
        
        <g v-for="(segment, segmentIndex) in path.definition" :key="'s-' + segment.id" :class="{hide: store.state.hideControls}" stroke="none" fill="blue">
          <!-- curve point handles -->
          <path 
            v-if="segment.type === 'C'" 
            :d="'M' + path.definition[segmentIndex - 1].dest.x + ' ' + path.definition[segmentIndex - 1].dest.y + ' L ' + segment.curve1.x + ' ' + segment.curve1.y"
            stroke="blue"
            stroke-width="0.5"
          ></path>
          <circle
            v-if="segment.type === 'C'"
            @mousedown="startPointMove(segment.id, 'curve1')"
            @click="selectPath(path.id, index)"
            :cx="segment.curve1.x" 
            :cy="segment.curve1.y" 
            r=".5" 
          ></circle>
          <path 
            v-if="segment.type === 'C'" 
            :d="'M' + segment.dest.x + ' ' + segment.dest.y + ' L ' + segment.curve2.x + ' ' + segment.curve2.y"
            stroke="blue"
            stroke-width="0.5"
          ></path>
          <circle
            v-if="segment.type === 'C'"
            @mousedown="startPointMove(segment.id, 'curve2')"
            @click="selectPath(path.id, index)"
            :cx="segment.curve2.x" 
            :cy="segment.curve2.y" 
            r=".5" 
          ></circle>

          <!-- dest points -->
          <circle
            @mousedown="startPointMove(segment.id, 'dest')"
            @mouseup="drawLine"
            @click="selectPath(path.id, index)"
            :cx="segment.dest.x" 
            :cy="segment.dest.y" 
            r="1" 
          ></circle>
        </g>
      </g>
      <path 
        id="live-preview-path"
        v-if="hasLivePreview"
        :d="livePreview" 
        stroke="blue" 
        :transform="transform(store.state.allPaths[store.state.selectedPathIndex])"
        :class="{hide: store.state.hideControls}"
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
    hasLivePreview: function() {
      return ( !store.state.isFirstPoint && store.state.tool === 'PEN')
    },
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
    drawLine() {
      let {tool} = this.store.state;
      if ( tool === 'PEN' ) {
        this.store.state.currentSegment = 'L';
        this.store.state.isDrawing = false;
      }
    },
    handleMouseDown: function(event) {
      let pathId = this.store.state.selectedPathId;
      
      if (pathId) {
        this.store.handleMouseDown(event, this.$refs[pathId][0].$el);
      }
    },
    handleMouseMove: function(event) {
      let pathId = this.store.state.selectedPathId;

      if (pathId) {
        this.store.handleMouseMove(event, this.$refs[pathId][0].$el);
      }
    },
    selectPath: function (id, index) {
      this.store.selectPath(id, index);
    },
    transform: function(path) {
      let t = '';
      if(path && path.rotation) {
        t += `rotate(${path.rotation} ${path.rotationCenter.x} ${path.rotationCenter.y})`;
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
  overflow: visible;
}

g.active {
  fill: blue;
}

.hide {
  display: none;
}

</style>
