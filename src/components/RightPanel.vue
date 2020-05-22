<template>
  <div class="app-right-panel shadow position-absolute top-0 right-0 h-100">
    <div class="accordion" v-if="store.state.selectedPathIndex != null">
      <AccordionItem :open="true" title="Transformation">
        
        <div class="form-group">
          <label class="form-label">Rotation</label>
          <input @focus="updateCenter" v-model.number="rotate" class="form-input-range w-50 display-inline mr-2" type="range" min="0" max="360">
          <input @focus="updateCenter" v-model.number="rotate" class="form-input w-25 display-inline" type="number">
        </div>

        <div class="form-group">
          <label class="form-label">Scale</label>
          <input @focus="updateCenter" v-model.number="scale" class="form-input-range w-50 display-inline mr-2" type="range" min="0.01" max="5" step="0.01">
          <input @focus="updateCenter" v-model.number="scale" class="form-input w-25 display-inline mr-1" type="number" min="0.01" step="0.01">

          <button class="btn btn-alt-gray-3 btn-sm btn-circle"
            @click="resetScaleVal"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M 4 12 L 8 17 L 20 7" stroke-width="2"></path></svg>
          </button>
        </div>

      </AccordionItem>
      <AccordionItem :open="true" title="Stroke">

        <div class="form-group">
            <label class="form-label">Line End</label>
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
          <input v-model.number="strokeWidth" class="form-input-range w-50 display-inline mr-2" type="range" min="0.5" max="6" step="0.5">
          <input v-model.number="strokeWidth" class="form-input w-25 display-inline" type="number">
        </div>
      </AccordionItem>
      <AccordionItem title="Segment Settings" v-if="segmentType !== 'M'">
          change to
          <select v-model="segmentType">
            <option value="L">Line</option>
            <option value="C">Bezier</option>
          </select>
      </AccordionItem>
    </div>

    <div class="position-absolute bottom-0 p-2 w-100">
      <button @click="store.createSVG" class="btn btn-primary w-100 mb-0">
        Get Code
      </button>
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
        this.store.updateScale(val, val);
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
      const { allPaths, selectedPathIndex }=this.store.state;

      allPaths[selectedPathIndex].scale.x = 1;
      allPaths[selectedPathIndex].scale.y = 1;
    },
    updateCenter: function() {
      if(window.SELECTED_PATH) {
          const bbox = window.SELECTED_PATH.getBBox();
          this.store.updatePathCenter(bbox)
          this.store.updateRotationCenter();
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.app-right-panel {
  width: 250px;
  background-color: #333;
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
</style>
