<template>
  <div class="app-right-panel shadow position-absolute top-0 right-0 h-100">
    <div class="accordion" v-if="store.state.selectedPathIndex !== null">
      <AccordionItem :open="true" title="Transformation">
        
        <div class="form-group">
          <label class="form-label">Rotation</label>
          <input @focus="updateCenter" @blur="bakeRotation()" v-model.number="rotate" class="form-input-range w-50 display-inline mr-2" type="range" min="0" max="360">
          <input @focus="updateCenter" @blur="bakeRotation()" v-model.number="rotate" class="form-input w-25 display-inline mr-1" type="number">

          <button class="btn btn-alt-gray-3 btn-sm btn-circle"
            @click="bakeRotation()"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M 4 12 L 8 17 L 20 7" stroke-width="2"></path></svg>
          </button>
        </div>

        <div class="form-group">
          <label class="form-label">Scale</label>
          <input @focus="updateCenter" @blur="resetScaleVal" v-model.number="scale" class="form-input-range w-50 display-inline mr-2" type="range" min="0.01" max="5" step="0.01">
          <input @focus="updateCenter" @blur="resetScaleVal" v-model.number="scale" class="form-input w-25 display-inline mr-1" type="number" min="0.01" step="0.01">

          <button class="btn btn-alt-gray-3 btn-sm btn-circle"
            @click="resetScaleVal"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M 4 12 L 8 17 L 20 7" stroke-width="2"></path></svg>
          </button>
        </div>

      </AccordionItem>
      <AccordionItem :open="true" title="Style">

        <div class="form-group">
            <label class="form-label">Line Join</label>
            <label class="form-radio mr-3">
              <input v-model="strokeLinejoin" value="miter" type="radio" name="radio-linejoin">
              <i class="radio"></i>
              <span>
                <svg height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M 21 21 L 3 21 L 3 3 L 21 3 L 21 21 Z M 12 21 L 12 12 L 21 12 " stroke-width="2"></path></svg>
              </span>
            </label>
            <label class="form-radio mr-3">
              <input v-model="strokeLinejoin" value="round" type="radio" name="radio-linejoin">
              <i class="radio"></i>
              <span>
                <svg height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M 21 21 L 3 21 S 3 11 3 11 C 3 6 6 3 11 3 L 21 3 L 21 21 Z M 12 21 L 12 12 L 21 12 " stroke-width="2"></path></svg>
              </span>
            </label>
            <label class="form-radio mr-3">
              <input v-model="strokeLinejoin" value="bevel" type="radio" name="radio-linejoin">
              <i class="radio"></i>
              <span>
                <svg height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M 21 21 L 3 21 L 3 11 L 11 3 L 21 3 L 21 21 Z M 12 21 L 12 12 L 21 12 " stroke-width="2"></path></svg>
              </span>
            </label>
          </div>

        <div class="form-group">
            <label class="form-label">Line End</label>
            <label class="form-radio mr-3">
              <input v-model="strokeLinecap" value="round" type="radio" name="radio-linecap">
              <i class="radio"></i>
              <span>
                <svg height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M 21 21 L 11 21 C 0 21 0 3 11 3 L 21 3 L 21 21 Z M 12 12 L 21 12 Z M 12 15 L 12 9 M 11 3 " stroke-width="2"></path></svg>
              </span>
            </label>
            <label class="form-radio mr-3">
              <input v-model="strokeLinecap" value="butt" type="radio" name="radio-linecap">
              <i class="radio"></i>
              <span>
                <svg height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M 21 21 L 11 21 L 11 3 L 21 3 L 21 21 Z M 12 12 L 21 12 Z M 12 15 L 12 9 " stroke-width="2"></path></svg>
              </span>
            </label>
            <label class="form-radio mr-3">
              <input v-model="strokeLinecap" value="square" type="radio" name="radio-linecap">
              <i class="radio"></i>
              <span>
                <svg height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M 21 21 L 3 21 L 3 3 L 21 3 L 21 21 Z M 12 12 L 21 12 Z M 12 15 L 12 9 " stroke-width="2"></path></svg>
              </span>
            </label>
          </div>

        <div class="form-group">
          <label class="form-label">Stroke width</label>
          <input v-model.number="strokeWidth" class="form-input-range w-50 display-inline mr-2" type="range" min="0" max="6" step="0.5">
          <input v-model.number="strokeWidth" class="form-input w-25 display-inline" type="number">
        </div>

        <div class="form-group">
          <label class="form-switch">
            <input v-model.number="hasFill" type="checkbox">
            <i class="switch"></i>
            <span class="ml-1">Fill</span>
          </label>
        </div>

        <div class="form-group">
          <label class="form-switch">
            <input v-model.number="isClosed" type="checkbox">
            <i class="switch"></i>
            <span class="ml-1">Close Path</span>
          </label>
        </div>

      </AccordionItem>

      <AccordionItem title="Segment Settings" :open="true" v-if="(segmentType !== 'M') && (store.state.tool === 'EDIT') && store.state.selectedPointId">
          Segment Type
          <select class="round bg-gray-3 text-light p-1 mb-2" v-model="segmentType">
            <option value="L">Line</option>
            <option value="C">Curve</option>
          </select>

          <br>
          <button class="btn btn-primary" @click="store.splitSegment(0.5)">
            <svg class="mr-1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path d=" M 2 2 L 2 6 L 6 6 L 6 2 L 2 2" stroke-width="2" stroke-linejoin="miter" stroke-linecap="butt" fill="none"></path><path d=" M 6 4 C 13 4 20 11 20 18" stroke-width="2" stroke-linejoin="miter" stroke-linecap="butt" fill="none"></path><path d=" M 18 18 L 18 22 L 22 22 L 22 18 L 18 18" stroke-width="2" stroke-linejoin="miter" stroke-linecap="butt" fill="none"></path><path d=" M 18 6 L 13 11" stroke-width="2" stroke-linejoin="miter" stroke-linecap="butt" fill="none"></path></svg>
            Split Segment
          </button>
      </AccordionItem>

      <AccordionItem title="Export" :open="true">
          <code class="bg-gray-3 text-light p-2 mb-2 display-block round">
              {{store.state.svgCode}}
          </code>
          <div class="btn-group">
            <button @click="store.createSVG" class="btn btn-alt-gray-3 w-50 mb-0 float-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path d=" M 10 4 L 2 12 L 10 20" stroke-width="2" stroke-linejoin="miter" stroke-linecap="butt"></path><path d=" M 14 20 L 22 12 L 14 4.000000000000001" stroke-width="2" stroke-linejoin="miter" stroke-linecap="butt"></path></svg>
            </button>
            <button @click="store.exportSVG" class="btn btn-gray-3 w-50 mb-0 float-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path d=" M 12 3 L 12 15" stroke-width="2" stroke-linejoin="miter" stroke-linecap="butt"></path><path d=" M 8 11 L 12 15 L 16 11" stroke-width="2" stroke-linejoin="miter" stroke-linecap="butt"></path><path d=" M 3 17 L 3 21 L 21 21 L 21 17" stroke-width="2" stroke-linejoin="miter" stroke-linecap="butt"></path></svg>
            </button>
          </div>
      </AccordionItem>

    </div>
  </div>
</template>

<script>
import store from "../store/store";
import AccordionItem from "./AccordionItem";

export default {
  name: "RightPanel",
  components: {
    AccordionItem
  },
  data: function() {
    return {
      store
    }
  },
  computed: {
    rotate: {
      get() {
        return this.store.state.allPaths[this.store.state.selectedPathIndex].rotation || 0;
      },
      set(val) {
        this.store.updateRotation(val)
      }
    },
    scale: {
      get() {
        return this.store.state.allPaths[this.store.state.selectedPathIndex].scale.x || 1;
      },
      set(val) {
        if (val >= 0.1) {
          this.store.updateScale(val, val); 
        }
      }
    },
    strokeLinecap: {
      get() {
        return this.store.state.allPaths[store.state.selectedPathIndex].strokeLinecap;
      },
      set(val) {
        this.store.setStrokeLinecap(val)
      }
    },
    strokeLinejoin: {
      get() {
        return this.store.state.allPaths[store.state.selectedPathIndex].strokeLinejoin;
      },
      set(val) {
        this.store.setStrokeLinejoin(val)
      }
    },
    strokeWidth: {
      get() {
        return this.store.state.allPaths[store.state.selectedPathIndex].strokeWidth;
      },
      set(val) {
        this.store.setStrokeWidth(val)
      }
    },
    hasFill: {
      get() {
        return this.store.state.allPaths[store.state.selectedPathIndex].hasFill;
      },
      set(val) {
        this.store.state.allPaths[store.state.selectedPathIndex].hasFill = val;
      }
    },
    isClosed: {
        get() {
          return this.store.state.allPaths[store.state.selectedPathIndex].isClosed;
        },
        set(val) {
          this.store.state.allPaths[store.state.selectedPathIndex].isClosed = val;
        }
    },
    segmentType: {
      get() {
        const { allPaths, selectedPathIndex, selectedPointIndex } = this.store.state
        if (selectedPointIndex === null) return;
        return allPaths[selectedPathIndex].definition[selectedPointIndex].type;
      },
      set(val) {
        if (val === 'C') {
          //just a dummy for now
          this.store.state.allPaths[store.state.selectedPathIndex].definition[store.state.selectedPointIndex].curve1 = {x:0, y:0};
          this.store.state.allPaths[store.state.selectedPathIndex].definition[store.state.selectedPointIndex].curve2 = {x:0, y:0};
        }
        if (val === 'L') {
          this.store.state.allPaths[store.state.selectedPathIndex].definition[store.state.selectedPointIndex].curve1 = {};
          this.store.state.allPaths[store.state.selectedPathIndex].definition[store.state.selectedPointIndex].curve2 = {};
        }
        this.store.state.allPaths[store.state.selectedPathIndex].definition[store.state.selectedPointIndex].type = val;
      }
    }
  },
  methods: {
    resetScaleVal: function() {
      this.store.resetScale();
      this.store.historySnapshot();
    },
    updateCenter: function() {
      if(window.SELECTED_PATH) {
          const bbox = window.SELECTED_PATH.getBBox();
          this.store.updatePathCenter(bbox)
          this.store.updateRotationCenter();
      }
    },
    bakeRotation: function() {
      this.store.bakeRotation();
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.app-right-panel {
  overflow-y: auto;
  width: 250px;
  background-color: #333;
  z-index: 1;
}

.accordion {
  border: none;
}

.accordion-item {
  color: #DDD;
  border-color: #444;
}

.form-input-range {
  -webkit-appearance: none; /* Hides the slider so that custom slider can be made */
  width: 100%; /* Specific width is required for Firefox. */
  background: transparent; /* Otherwise white in Chrome */
  
  
}

.form-input-range:focus {
  outline: none;
}

.form-input-range:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 5px rgb(54, 59, 210, 0.2);
}

.form-input-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background-color: #363bd2;
  margin-top: -5px;
  transition: .3s box-shadow;
}

.form-input-range::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  cursor: pointer;
  border-radius: 3px; 
  background: #DDD;
}

.form-group svg {
  vertical-align: middle;
}

.btn svg {
  vertical-align: text-bottom;
}

code {
  max-height: 150px;
  overflow: auto;
  word-wrap: break-word;
}

.float-none {
  float: none !important;
}
</style>
