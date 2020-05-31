<template>
  <div class="left-panel h-100 display-table position-absolute top-0">
    <div class="left-panel-inner display-table-cell p-5 text-center">

      <button
        @click="store.selectTool('EDIT')"
        class="btn btn-primary btn btn-primary btn-circle btn-xl"
        :class="{active: store.state.tool === 'EDIT'}"
        title="Edit (E)"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path data-v-076a7a29="" data-v-306af221="" d="M     5 5L     5 5L     14 25L     16 16L     25 13Z      " fill="none" transform="" stroke-linecap="butt" stroke-width="2"></path></svg>
      </button>

      <button
        @click="store.selectTool('SELECT')"
        class="btn btn-primary btn btn-primary btn-circle btn-xl"
        :class="{active: store.state.tool === 'SELECT'}"
        title="Select (S)"
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

      
      <button
        @click="store.copyPath()"
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M 4 4 L 4 8 L 20 8 L 20 3 L 4 3 Z M 6 8 L 6 21 L 18 21 L 18 8 M 10 9 L 10 20 M 14 9 L 14 21 " stroke-width="2"></path></svg>
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
</style>
