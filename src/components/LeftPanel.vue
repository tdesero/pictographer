<template>
  <div class="left-panel h-100 display-table position-absolute top-0">
    <div class="left-panel-inner display-table-cell p-5 text-center">

      <button
        @click="store.selectTool('SELECT')"
        class="btn btn-primary btn btn-primary btn-circle btn-xl"
        :class="{active: store.state.tool === 'SELECT'}"
        title="Select (S)"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path data-v-076a7a29="" data-v-306af221="" d="M     5 5L     5 5L     14 25L     16 16L     25 13Z      " fill="none" transform="" stroke-linecap="butt" stroke-width="2"></path></svg>
      </button>

      <button
        @click="store.selectTool('EDIT')"
        class="btn btn-primary btn btn-primary btn-circle btn-xl"
        :class="{active: store.state.tool === 'EDIT'}"
        title="Edit (E)"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M 19 10 L 19 4 L 4 4 L 4 19 L 10 19 M 11 11 L 15 21 L 17 17 L 21 15 Z M 2 17 L 2 21 L 6 21 L 6 17 Z M 6 2 L 6 6 L 2 6 L 2 2 Z M 17 2 L 21 2 L 21 6 L 17 6 Z" stroke-width="2"></path></svg>
      </button>


      <button
        @click="store.selectTool('PEN')"
        class="btn btn-primary btn btn-primary btn-circle btn-xl"
        :class="{active: store.state.tool === 'PEN'}"
        title="Pen (P)"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M 19 2 L 13 8 L 10 6 L 4 13 L 2 22 L 12 20 L 18 14 L 16 11 L 22 5 L 19 2 Z M 2 22 L 9 15 M 16 5 L 19 8 " stroke-width="2"></path></svg>
      
      </button>

       <button
        @click="store.selectTool('RECT')"
        class="btn btn-primary btn btn-primary btn-circle btn-xl"
        :class="{active: store.state.tool === 'RECT'}"
        title="Pen (P)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path d=" M 3 3 L 3 21 L 21 21 L 21 3 L 3 3 Z" stroke-width="2" stroke-linejoin="miter" stroke-linecap="butt" fill="none"></path></svg>
      
      </button>

      <div class="btn-hover-group position-relative mb-2">
        <button class="btn btn-primary btn-circle btn-xl trigger m-0">
        +
        </button>
        <div class="btn-hover-group-inner">

            <!-- Circle Shape with Modal -->
            <ShapeModal btnTitle="Add Circle" modalTitle="Create a Circle" @confirm="addCircle()">
              <template v-slot:icon>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M     2.4582000166892914 12.000000016689302C 2.4582000166892914 6.730209390751875 6.730209390751827 2.4582000166893003 12.000000016689302 2.4582000166893003C 17.26979064262678 2.4582000166893003 21.541800016689265 6.730209390751875 21.541800016689265 12.000000016689302C 21.541800016689265 17.26979064262674 17.26979064262678 21.541800016689308 12.000000016689302 21.541800016689308C 6.730209390751827 21.541800016689308 2.4582000166892914 17.26979064262674 2.4582000166892914 12.000000016689302Z     0.8400000166893005 0.8400000166893005" stroke-width="2"></path></svg>
              </template>
              <template v-slot:content>
                <div class="form-group">
                  <label class="form-label display-inline mr-2">Radius</label>
                  <input class="form-input form-input-radius display-inline" v-model.number="circleRadius" type="number" />
                </div>
              </template>
            </ShapeModal>
          <!-- Star Shape with Modal -->
        <ShapeModal btnTitle="Add Star" modalTitle="Create a Star" @confirm="addStar()">
          <template v-slot:icon>
            <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path d=" M 12.04799815248184 17.82773106066078 L 17.6635632622761 20.780008351010338 L 16.591085759324407 14.526984705835558 L 21.134173366167 10.098568770311253 L 14.855780707378965 9.186264915486026 L 12.04799815248184 3.4970760606607936 L 9.240215597584719 9.186264915486026 L 2.9618229387966863 10.09856877031125 L 7.504910545639265 14.526984705835558 L 6.432433042687578 20.780008351010338 L 12.04799815248184 17.82773106066078" stroke-width="2" stroke-linejoin="miter" stroke-linecap="butt"></path></svg>
          </template>
          <template v-slot:content>
            <div class="form-group">
              <label class="form-label display-inline mr-2">Radius 1</label>
              <input 
                class="form-input form-input-radius display-inline" 
                v-model.number="starR1" 
                type="number" 
              />
              <label class="form-label display-inline mr-2">Radius 2</label>
              <input 
                class="form-input form-input-radius display-inline" 
                v-model.number="starR2" 
                type="number" 
              />
              <label class="form-label display-inline mr-2">Arms</label>
              <input 
                class="form-input form-input-radius display-inline" 
                v-model.number="starArms" 
                type="number" 
              />
            </div>
          </template>
        </ShapeModal>
      </div>
    </div>
     

      
      <button
        @click="store.copyPastePath()"
        title="Copy"
        class="btn btn-secondary btn btn-primary btn-circle btn-xl"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path d=" M 3 7 L 17 7 L 17 21 L 3 21 Z" stroke-width="2" stroke-linejoin="miter" stroke-linecap="butt"></path><path d=" M 7 3 L 21 3 L 21 18" stroke-width="2" stroke-linejoin="miter" stroke-linecap="butt"></path></svg>
      </button>


      <button
        @click="store.deleteAction()"
        title="Delete"
        class="btn btn-secondary btn btn-primary btn-circle btn-xl"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none"><path d=" M 3 6 L 21 6" stroke-width="2" stroke-linejoin="miter" stroke-linecap="square" fill="none"></path><path d=" M 5 6 L 5 19 C 5 21 6 22 8 22 L 16 22 C 18 22 19 21 19 19 L 19 5" stroke-width="2" stroke-linejoin="miter" stroke-linecap="butt" fill="none"></path><path d=" M 8 6 L 8 3 C 8 3 8 2 9 2 C 10 2 14 2 15 2 C 16 2 16 3 16 3 L 16 6" stroke-width="2" stroke-linejoin="miter" stroke-linecap="butt" fill="none"></path><path d=" M 10 10 L 10 18" stroke-width="2" stroke-linejoin="miter" stroke-linecap="butt" fill="none"></path><path d=" M 14 10 L 14 18" stroke-width="2" stroke-linejoin="miter" stroke-linecap="butt" fill="none"></path></svg>
      </button>

    </div>
  </div>
</template>

<script>
import store from "../store/store";
import ShapeModal from "./ShapeModal";

export default {
  name: "LeftPanel",
  components: {
    ShapeModal
  },
  data: function() {
    return {
      store,
      circleRadius: 2,
      starR1: 2,
      starR2: 5,
      starArms: 5,
    };
  },
  methods: {
    addCircle: function() {
      this.store.addCircle({x: 12, y: 12}, this.circleRadius)
    },
    addStar: function() {
      this.store.addStar({x: 12, y: 12}, this.starR1, this.starR2, this.starArms)
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.left-panel {
  max-width: 5rem;
  max-width: 5rem;
  z-index: 9;
  pointer-events: none;
}

.left-panel-inner {
  vertical-align: middle;
}

.btn-circle {
  margin-bottom: 1rem;
  pointer-events: auto;
  transition: .3s transform;
}

.btn-primary.active {
  background-color:#212480;
}

.btn-circle:hover {
  transform: translate(4px, 0);
}

.form-input-radius {
  width: 4rem;
}

.btn-hover-group-inner {
  position: absolute;
  white-space: nowrap;
  top: 0;
  padding-left: 6px;
  min-width: 45.5px;
  transition: 0.3s padding-left;
  text-align: left;
  border-radius: 999px;
  z-index: -1;
  pointer-events: all;
}

.btn-hover-group >>> .btn-circle:hover {
  transform: unset !important;
}

.btn-hover-group-inner .shape-modal {
  position: relative;
  display: inline-block;
  margin-right: -43.5px;
  margin-left: 0;
  margin-bottom: 0;
  transition: .3s margin;
  opacity: 0.35;
}
    
.btn-hover-group-inner .btn:nth-child(1) {
  z-index: 10;
}
.btn-hover-group-inner .btn:nth-child(2) {
  z-index: 9;
}
.btn-hover-group-inner .btn:nth-child(3) {
  z-index: 8;
}
.btn-hover-group-inner .btn:nth-child(4) {
  z-index: 7;
}

.btn-hover-group:hover .btn-hover-group-inner {
    padding-left: 55px;
  }
  
.btn-hover-group:hover .shape-modal {
  margin-left: 0;
  margin-right: 0.5rem;
  opacity: 1;
}
</style>
