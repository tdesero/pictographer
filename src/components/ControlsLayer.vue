<template>
  <svg 
      @mousedown="handleMouseDown" 
      @mousemove="handleMouseMove"
      class="controls-layer position-absolute w-100 h-100 top-0 left-0" ref="svg"
      v-if="!this.store.state.hideControls"
      >
        <EditPath v-for="(path, index) in store.state.allPaths" :definition="path.definition" :path="path" :key="path.id" :id="path.id" :index="index" :scaleX="scaleX" :scaleY="scaleY"></EditPath>

        <g v-for="(path, index) in store.state.allPaths" :key="'g-' + path.id" :class="{active: path.id === store.state.selectedPathId}" :transform="transform(path)">
        
            <g v-for="(segment, segmentIndex) in path.definition" :key="'s-' + segment.id" :class="{hide: store.state.hideControls}" stroke="none" fill="blue">
            <!-- curve point handles -->
            <path 
                v-if="segment.type === 'C'" 
                :d="'M' + path.definition[segmentIndex - 1].dest.x * scaleX + ' ' + path.definition[segmentIndex - 1].dest.y * scaleY + ' L ' + segment.curve1.x * scaleX + ' ' + segment.curve1.y * scaleY"
                stroke="blue"
                stroke-width="1"
            ></path>
            <circle
                v-if="segment.type === 'C'"
                @mousedown="startPointMove(segment.id, 'curve1')"
                @click="selectPath(path.id, index)"
                :cx="segment.curve1.x * scaleX" 
                :cy="segment.curve1.y  * scaleY" 
                r="4" 
            ></circle>
            <path 
                v-if="segment.type === 'C'" 
                :d="'M' + segment.dest.x * scaleX + ' ' + segment.dest.y * scaleY + ' L ' + segment.curve2.x * scaleX + ' ' + segment.curve2.y * scaleY"
                stroke="blue"
                stroke-width="1"
            ></path>
            <circle
                v-if="segment.type === 'C'"
                @mousedown="startPointMove(segment.id, 'curve2')"
                @click="selectPath(path.id, index)"
                :cx="segment.curve2.x * scaleX" 
                :cy="segment.curve2.y * scaleY" 
                r="4" 
            ></circle>

            <!-- dest points -->
            <rect
                @mousedown="startPointMove(segment.id, 'dest')"
                @mouseup="drawLine"
                @click="selectPath(path.id, index)"
                :x="segment.dest.x * scaleX - 5" 
                :y="segment.dest.y * scaleY - 5" 
                width="10"
                height="10"
            ></rect>
        </g>
        </g>

        <!-- live line preview -->
        <path 
        id="live-preview-path"
        v-if="hasLivePreview"
        :d="livePreview" 
        stroke="blue" 
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
      EditPath
  },
  data: function() {
    return {
        store,
        private: {
            width: 0,
            height: 0,
        }
    }
  },
  mounted: function() {
      this.private.width = this.$refs.svg.clientWidth;
      this.private.height = this.$refs.svg.clientHeight;
      window.addEventListener('resize', function() {
            this.private.width = this.$refs.svg.clientWidth;
            this.private.height = this.$refs.svg.clientHeight;
            console.log(this.private.width)
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
    handleMouseDown(event) {
        this.$emit('handleMouseDown', event)
    },
    handleMouseMove(event) {
        this.$emit('handleMouseMove', event)
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.controls-layer {
    overflow: visible;
}
</style>
