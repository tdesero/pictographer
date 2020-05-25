<template>
  <div  class="v_app-canvas position-relative shadow" 
        @mouseup="endPointMove" 
        :class="{'cursor-pen': store.state.tool === 'PEN', 'hide-grid': store.state.hideControls}" 
        :style="{backgroundSize: 100/store.state.viewBox.x + '% ' + 100/store.state.viewBox.y + '%' }">
    <svg 
      class="w-100" 
      stroke="black" 
      :viewBox="'0 0 ' + store.state.viewBox.x + ' ' + store.state.viewBox.y"
    >
      <SvgPath v-for="(path, index) in store.state.allPaths" :definition="path.definition" :path="path" :key="path.id" :id="path.id" :index="index" :ref="path.id"></SvgPath>
    </svg>

    <ControlsLayer
      @handleMouseDown="handleMouseDown"
      @handleMouseMove="handleMouseMove"
    ></ControlsLayer>

  </div>
</template>

<script>
import store from "../store/store";
import SvgPath from "./SvgPath";
import ControlsLayer from "./ControlsLayer";

export default {
  name: "MainCanvas",
  data: function() {
    return {
      store
    };
  },
  components: {
    SvgPath,
    ControlsLayer
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
  /*height: 100%;*/
  width: 100%;
  /*max-height: 500px;*/
  max-width: 500px;
  overflow: visible;
  margin: auto;
  top: calc(50% - 250px);
  background-image:
    linear-gradient(to right,rgba(150, 150, 150, 0.35) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(150, 150, 150, 0.35) 1px, transparent 1px);
  background-repeat: repeat;
}

svg {
  display: block;
}

g.active {
  fill: blue;
}

.hide-grid {
  background-image: none;
}

.hide {
  display: none;
}

.cursor-pen {
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="currentColor"><path d="M 19 2 L 13 8 L 10 6 L 4 13 L 2 22 L 12 20 L 18 14 L 16 11 L 22 5 L 19 2 Z M 2 22 L 9 15 M 16 5 L 19 8 " stroke-width="2"></path></svg>') 0 200, auto;
  cursor: -webkit-image-set(
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="currentColor"><path d="M 19 2 L 13 8 L 10 6 L 4 13 L 2 22 L 12 20 L 18 14 L 16 11 L 22 5 L 19 2 Z M 2 22 L 9 15 M 16 5 L 19 8 " stroke-width="2"></path></svg>') 1x,
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white" stroke="currentColor"><path d="M 19 2 L 13 8 L 10 6 L 4 13 L 2 22 L 12 20 L 18 14 L 16 11 L 22 5 L 19 2 Z M 2 22 L 9 15 M 16 5 L 19 8 " stroke-width="2"></path></svg>') 2x
  ) 0 200, auto;
}
</style>
