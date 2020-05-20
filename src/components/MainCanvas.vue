<template>
  <div class="v_app-canvas absolute-center shadow" @mouseup="endPointMove">
    <svg 
      class="w-100" stroke="black" :viewBox="'0 0 ' + store.state.viewBox.x + ' ' + store.state.viewBox.y">
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
