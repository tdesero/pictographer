<template>
  <svg
      @mousedown="handleMouseDown" 
      @click="handleClick" 
      @mousemove="handleMouseMove"
      class="controls-layer position-absolute w-100 h-100 top-0 left-0" ref="svg"
      v-if="!this.store.state.hideControls"
      >
        <EditPath v-for="(path, index) in store.state.allPaths" :definition="path.definition" :path="path" :key="path.id" :id="path.id" :index="index" :scaleX="scaleX" :scaleY="scaleY"></EditPath>

        <g v-for="(path, index) in store.state.allPaths" :key="'group-' + path.id" :class="{active: path.id === store.state.selectedPathId}" :transform="transform(path)">
        
            <g v-for="(segment, segmentIndex) in path.definition" :key="'seg-' + segment.id" :class="{hide: (index !== store.state.selectedPathIndex) || (store.state.tool === 'SELECT')}" stroke="none" fill="#363bd2">

            <!-- active segment -->
            <path
              id="active-segment"
              v-if="segment.id === store.state.selectedPointId && segment.type !== 'Z' && segment.type !== 'M'"
              :d="activeSegment"
              stroke="#363bd2"
              stroke-width="10"
              fill="none"
            ></path>

            <!-- curve point handles -->
            <path 
                v-if="segment.type === 'C'" 
                :d="'M' + path.definition[segmentIndex - 1].dest.x * scaleX + ' ' + path.definition[segmentIndex - 1].dest.y * scaleY + ' L ' + segment.curve1.x * scaleX + ' ' + segment.curve1.y * scaleY"
                stroke="#363bd2"
                stroke-width="1"
            ></path>
            <circle
                v-if="segment.type === 'C'"
                @mousedown="pointHandleMouseDown(segment.id, segmentIndex, 'curve1', path.id, index)"
                :cx="segment.curve1.x * scaleX" 
                :cy="segment.curve1.y  * scaleY" 
                r="4" 
                class="cursor-edit"
            ></circle>
            <path 
                v-if="segment.type === 'C'" 
                :d="'M' + segment.dest.x * scaleX + ' ' + segment.dest.y * scaleY + ' L ' + segment.curve2.x * scaleX + ' ' + segment.curve2.y * scaleY"
                stroke="#363bd2"
                stroke-width="1"
            ></path>
            <circle
                v-if="segment.type === 'C'"
                @mousedown="pointHandleMouseDown(segment.id, segmentIndex, 'curve2', path.id, index)"
                :cx="segment.curve2.x * scaleX" 
                :cy="segment.curve2.y * scaleY" 
                r="4" 
                class="cursor-edit"
            ></circle>

            <!-- dest points (square points, destinationselec) -->
            <rect
                v-if="segment.type !== 'Z'"
                @mousedown="pointHandleMouseDown(segment.id, segmentIndex, 'dest', path.id, index)"
                @mouseup="drawLine"
                :x="segment.dest.x * scaleX - 5" 
                :y="segment.dest.y * scaleY - 5" 
                class="path-point cursor-edit"
                :class="{ active: segment.id === store.state.selectedPointId }"
                :key="'point-' + segment.id"
                width="10"
                height="10"
            ></rect>
          </g>

          <!-- bounding boxes -->
          <rect
              v-if="store.state.tool === 'SELECT'"
              :class="{hide: path.id !== store.state.selectedPathId}"
              :x="path.bbox.x * scaleX" 
              :y="path.bbox.y * scaleY"
              :key="'bbox-' + path.id"
              :width="(path.bbox.width * scaleX) || 1"
              :height="(path.bbox.height * scaleY )|| 1"
              fill="none"
              stroke="#363bd2"
          ></rect>
        </g>

        <!-- live line preview -->
        <path 
          id="live-preview-path"
          v-if="hasLivePreview"
          :d="livePreview" 
          stroke="#363bd2" 
          :transform="transform(store.state.allPaths[store.state.selectedPathIndex])"
          :class="{hide: store.state.hideControls}"
        ></path>

    </svg>
</template>

<script>
import store from "../store/store";
import EditPath from "./EditPath";

export default {
  name: "ControlsLayer",
  components: {
      EditPath,
  },
  data: function() {
    return {
        store,
        private: {
            width: 0,
            height: 0,
            shouldUnselect: false,
        }
    }
  },
  mounted: function() {
    this.private.width = this.$refs.svg.clientWidth;
    this.private.height = this.$refs.svg.clientHeight;
    window.addEventListener('resize', function() {
          this.private.width = this.$refs.svg.clientWidth;
          this.private.height = this.$refs.svg.clientHeight;
    }.bind(this))
  },
  computed: {
    scaleX: function() {
        const { viewBox } = this.store.state;
        const { width } = this.private;
        return width/viewBox.x;
    },
    scaleY: function() {
        const { viewBox } = this.store.state;
        const { height } = this.private;
        return height/viewBox.y;
    },
    viewBoxX: function() {
      return this.store.state.viewBox.x;
    },
    viewBoxY: function() {
      return this.store.state.viewBox.y;
    },
    hasLivePreview: function() {
      return ( !store.state.isFirstPoint && store.state.tool === 'PEN')
      },
    livePreview: function() {
      const {currentPoint, livePreviewSegment} = this.store.state;
      const { scaleX, scaleY } = this;
      let d = ''
      if (livePreviewSegment.dest) {
          d = ['M', currentPoint.x * scaleX, currentPoint.y * scaleY, livePreviewSegment.type, livePreviewSegment.dest.x * scaleX, livePreviewSegment.dest.y * scaleY].join(' ');
      }
      return d;
    },
    activeSegment: function() {
      const {allPaths, selectedPathIndex, selectedPointIndex} = this.store.state;
      const { scaleX, scaleY } = this;
      let d = 0
      if (selectedPointIndex !== null && selectedPathIndex !== null) {
          const {curve1, curve2, dest, type} = allPaths[selectedPathIndex].definition[selectedPointIndex];
          if (type === 'M' || type === 'Z') return;
          const startPoint = allPaths[selectedPathIndex].definition[selectedPointIndex-1].dest;

          d = ['M', 
                startPoint.x !== undefined ? startPoint.x * scaleX : '', 
                startPoint.y !== undefined ? startPoint.y * scaleY : '', 
                type, 
                curve1.x !== undefined ? curve1.x * scaleX : '', 
                curve1.y !== undefined ? curve1.y * scaleY : '', 
                curve2.x !== undefined ? curve2.x * scaleX : '', 
                curve2.y !== undefined ? curve2.y * scaleY : '', 
                dest.x !== undefined ? dest.x * scaleX : '', 
                dest.y !== undefined ? dest.y * scaleY : ''].join(' ');
          console.log(d)
      }
      return d;
    }
  },
  watch: {
    viewBoxX: function() {
      this.private.width = this.$refs.svg.clientWidth;
      this.private.height = this.$refs.svg.clientHeight;
    },
    viewBoxY: function() {
      this.private.width = this.$refs.svg.clientWidth;
      this.private.height = this.$refs.svg.clientHeight;
    }
  },
  methods: {
    transform: function(path) {
    const { scaleX, scaleY } = this;
    let t = '';
    if(path && path.rotation) {
    t += `rotate(${path.rotation} ${path.rotationCenter.x * scaleX} ${path.rotationCenter.y * scaleY})`;
    }
    return t;
    },
    selectPath: function (id, index) {
      this.store.selectPath(id, index);
    },
    startPointMove: function(id, step) {
      this.store.setSelectedPoint(id, step)
    },
    drawLine() {
      let {tool} = this.store.state;
      if ( tool === 'PEN' ) {
        this.store.state.currentSegment = 'L';
        this.store.state.isDrawing = false;
      }
    },
    handleClick() {
      let {tool} = this.store.state;
      const {shouldUnselect} = this.private;
      if ( tool !== 'PEN' && shouldUnselect) {
          this.store.unselectPath();
          this.private.shouldUnselect = false;
      }
    },
    handleMouseDown(event) {
      let {tool} = this.store.state;
      if ( tool !== 'PEN' && event.target.matches('.controls-layer')) {
          this.private.shouldUnselect = true;
      }
      this.$emit('handleMouseDown', event)
    },
    handleMouseMove(event) {
      this.$emit('handleMouseMove', event)
    },
    pointHandleMouseDown(segmentId, segmentIndex, pointType, pathId, pathIndex) {
      if (this.store.debug) console.log('pointHandleMouseDown', 'ControlsLayer');
      const { tool, allPaths, selectedPointIndex, selectedPathId, isFirstPoint } = this.store.state;
      let shouldJoin = false;

      const oldPointIsLast = function() {
        return selectedPointIndex === allPaths[pathIndex].definition.length - 1;
      }
      const newPointIsLast = function() {
        return segmentIndex === allPaths[pathIndex].definition.length - 1;
      }

      if ( (tool === 'PEN') && (selectedPathId === pathId) && !isFirstPoint) {
        /* close path on first point & last point */
        if ( segmentIndex === 0 && oldPointIsLast) {
          shouldJoin = true;
        } else if ( newPointIsLast && selectedPointIndex === 0 ) {
          shouldJoin = true;
        }
      }
      if (shouldJoin) { this.store.joinPoints(pathIndex); }

      if ( tool !== 'PEN') {
        this.selectPath(pathId, pathIndex);
        this.startPointMove(segmentId, pointType); //sets selected point
      }

      if (tool === 'PEN') {
        // if the point is first or last one...
        if (segmentIndex === 0) {
          event.stopPropagation();
          this.store.continuePath(pathId, pathIndex, segmentId, segmentIndex);
        } else if(newPointIsLast) {
          event.stopPropagation();
          this.store.continuePath(pathId, pathIndex, segmentId, segmentIndex);
        }
      }
      
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.path-point {
  stroke:#363bd2;
  stroke-width: 1px;
  fill: #FFF;
  z-index: 99;
}

.path-point.active {
  fill:#363bd2;
}

.controls-layer {
    overflow: visible;
}

.hide {
  visibility: hidden;
}

#active-segment {
  pointer-events: none;
  opacity: 0.7;
}

.cursor-edit {
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="currentColor"><path data-v-076a7a29="" data-v-306af221="" d="M     5 5L     5 5L     14 25L     16 16L     25 13Z      " stroke-linecap="butt" stroke-width="2"></path></svg>'), auto;
  cursor: -webkit-image-set(
  url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="currentColor"><path data-v-076a7a29="" data-v-306af221="" d="M     5 5L     5 5L     14 25L     16 16L     25 13Z      " stroke-linecap="butt" stroke-width="2"></path></svg>') 1x,
  url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white" stroke="currentColor"><path data-v-076a7a29="" data-v-306af221="" d="M     5 5L     5 5L     14 25L     16 16L     25 13Z      " stroke-linecap="butt" stroke-width="2"></path></svg>') 2x
), auto;
}
</style>
