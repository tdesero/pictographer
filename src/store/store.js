import Vue from 'vue';

window.SELECTED_PATH = {};

function emptyPath() {
  return {
    id: new Date().getTime(),
    definition: [],
    rotation: null,
    center: {},
    rotationCenter: {},
    strokeLinecap: 'butt',
    strokeLinejoin: 'miter',
    strokeWidth: 2,
  }
}

function roundPoint(point) {
  let newPoint = {}
  newPoint.x = Math.round(point.x);
  newPoint.y = Math.round(point.y);

  return newPoint;
}

const store = {
  debug: true,
  state: {
    history: [],
    historyPos: -1, // -1 means history is not active
    allPaths: [],
    selectedPathIndex: null,
    selectedPathId: null,
    tool: 'PEN',
    transformMatrix: null,
    currentPoint: {},
    livePreviewSegment: {},
    selectedPointId: null,
    selectedPointStep: null,
    selectedPointIndex: null,
    movePoint: false,
    svgPoint: {},
    isFirstPoint: true,
    isDrawing: false,
    currentSegment: 'L',
    snapToGrid: true,
    hideControls: false,
    viewBox: {x: 30, y: 30}
  },

  /**
   * Create empty path.
   * @public
   */
  createPath() {
    if (this.debug) console.log("createPath");

    this.state.allPaths.push(emptyPath());
    this.state.selectedPathIndex = this.state.allPaths.length - 1;
    this.state.selectedPathId = this.state.allPaths[this.state.selectedPathIndex].id;

    /* clear currentPoint */
    this.state.isFirstPoint = true;

    if (this.debug) console.log("index:", this.state.selectedPathIndex);
    if (this.debug) console.log("id:", this.state.selectedPathId);
  },

  /**
   * select tool
   * 'PEN', 'CIRCLE', 'RECT', 'SELECT', 'NONE'
   * @param {string} tool
   * @public
   */
  selectTool(tool) {
    if (this.debug) console.log("selectTool", tool);
    this.state.tool = tool;

    if (tool === 'PEN' && this.state.selectedPathIndex === null) {
      this.createPath();
    }
  },

  /**
   * handle mousedown depending on selected tool
   * expects the dom element of the currently selected path
   * @param {object} event
   * @param {array} domElement
   * @public
   */
  handleMouseDown(event, domElement) {
    if (this.debug) console.log("handleMouseDown");
    this.state.transformMatrix = domElement.getScreenCTM().inverse();
    this.state.svgPoint = document.querySelector('#app svg').createSVGPoint();

    const { selectedPointIndex, selectedPathIndex } = this.state;
    let pathLength;
    
    if (selectedPathIndex !== null) {
      pathLength = this.state.allPaths[selectedPathIndex].definition.length;
    }

    switch(this.state.tool) {   
      case 'PEN':
        this.state.isDrawing = true;
        if( (pathLength - 1) === selectedPointIndex) {
          if (this.debug) console.log('end')
          this.addSegment(event, 'END');
        } else if( selectedPointIndex === 0 ) {
          if (this.debug) console.log('start')
          this.addSegment(event, 'START');
        } else {
          if (this.debug) console.log('new')
          this.createPath()
          this.addSegment(event, 'NEW');
        }
        break;
      default:
        return;
    }
  },

  /* TODO */
  handleMouseMove(event) {
    if (this.debug) console.log("handleMouseMove");

    /* pen selected */
    if (this.state.tool === 'PEN' && !this.state.movePoint) {
      if (this.state.allPaths[this.state.selectedPathIndex].definition.length === 0) return;
      let point = this.state.svgPoint;
      point.x = event.clientX;
      point.y = event.clientY;
      point = point.matrixTransform(this.state.transformMatrix);
      if (this.state.snapToGrid) { point = roundPoint(point) }

      this.state.livePreviewSegment = {type: 'L', dest: {x: point.x, y: point.y}};
    }

    /* Draw Bezier */
    if (this.state.tool === 'PEN' && this.state.isDrawing) {
      let { allPaths, selectedPathIndex, selectedPointIndex, snapToGrid } = this.state;
      let fromPoint = allPaths[selectedPathIndex].definition[selectedPointIndex - 1].dest;

      let point = this.state.svgPoint;
      point.x = event.clientX;
      point.y = event.clientY;
      point = point.matrixTransform(this.state.transformMatrix);
      if (snapToGrid) { point = roundPoint(point) }

      allPaths[selectedPathIndex].definition[selectedPointIndex].type = 'C';
      allPaths[selectedPathIndex].definition[selectedPointIndex].curve1 = { x: fromPoint.x, y: fromPoint.y };
      allPaths[selectedPathIndex].definition[selectedPointIndex].curve2 = { x: point.x, y: point.y}
    }

    /* moving point */
    if (this.state.movePoint) {
      let point = this.state.svgPoint;
      point.x = event.clientX;
      point.y = event.clientY;
      point = point.matrixTransform(this.state.transformMatrix);
      if (this.state.snapToGrid) { point = roundPoint(point) }

      /* this moves the current selected point */
      this.state.allPaths[this.state.selectedPathIndex].definition[this.state.selectedPointIndex][this.state.selectedPointStep] = {x: point.x, y: point.y};
    }
  },

  handleMouseUp() {
    let {allPaths, selectedPathIndex, selectedPointIndex} = this.state;

    if (this.state.movePoint) {
      this.historySnapshot()
    }

    this.state.movePoint = false;

    this.state.isDrawing = false;

    if (selectedPathIndex !== null && selectedPointIndex !== null) {
      this.state.currentPoint = allPaths[selectedPathIndex].definition[selectedPointIndex].dest;
    }
  },

  /* TODO where = 'END' || 'START' || 'NEW' */
  addSegment(event, where) {
    if (this.debug) console.log("addSegment", event);

    let { allPaths, selectedPathIndex, selectedPointIndex } = this.state;

    // create new SVG Point
    let point = document.querySelector('#app svg').createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    point = point.matrixTransform(this.state.transformMatrix);
    if (this.state.snapToGrid) { point = roundPoint(point) }

    this.state.currentPoint = {x: point.x, y: point.y};

    if (where === 'END') {
      let id = new Date().getTime();

      allPaths[selectedPathIndex].definition.push({
        type: 'L',
        id: id,
        curve1: {},
        curve2: {},
        dest: {
          x: point.x,
          y: point.y
        }
      })
      this.state.selectedPointId = id;
      this.state.selectedPointIndex++;
    }
    if (where === 'START') {
      let id = new Date().getTime();

      allPaths[selectedPathIndex].definition.unshift({
        type: 'M',
        id: id,
        curve1: {},
        curve2: {},
        dest: {
          x: point.x,
          y: point.y
        }
      })
      allPaths[selectedPathIndex].definition[selectedPointIndex + 1].type = 'L';
      this.state.selectedPointId = id;
      this.state.isDrawing = false;
    }
    if ( where === "NEW" ) {
      let id = new Date().getTime();
      this.state.allPaths[this.state.selectedPathIndex].definition.push({
        type: 'M',
        id: id,
        curve1: {},
        curve2: {},
        dest: {
          x: point.x,
          y: point.y
        }
      })
      this.state.isDrawing = false;
      this.state.selectedPointId = id;
      this.state.selectedPointIndex = 0;
    } 

    this.state.isFirstPoint = false;
    this.historySnapshot();
  },

  deleteSegment() {
    if (this.debug) console.log("deleteSegment");

    let {selectedPointIndex, selectedPathIndex} = this.state;

    if (selectedPointIndex !== null) {
      if ( selectedPointIndex === 0 ) {

        if (this.state.allPaths[selectedPathIndex].definition.length > 1) {
          /* make the first point moveto ('M') instead of lineto ('L') */
          this.state.allPaths[selectedPathIndex].definition[1].type = 'M';
          this.state.allPaths[selectedPathIndex].definition[1].curve1 = {};
          this.state.allPaths[selectedPathIndex].definition[1].curve2 = {};
        }
        
      }
      this.state.allPaths[selectedPathIndex].definition.splice(this.state.selectedPointIndex, 1);

      /* clear selected path */
      this.state.selectedPointIndex = null;
      this.state.selectedPointId = null;
    }
    this.historySnapshot();
  },

  selectPath(id, index) {
    if (this.debug) console.log("selectPath", id, index);

    if (this.state.tool === "SELECT") {
      this.state.selectedPathId = id;
      this.state.selectedPathIndex = index;
    }
  },

  /* TODO */
  setSelectedPoint(id, step) {
    let { allPaths, selectedPathIndex} = this.state;

    this.state.movePoint = true;
    this.state.selectedPointId = id;
    this.state.selectedPointStep = step;
    this.state.selectedPointIndex = allPaths[selectedPathIndex].definition.findIndex(p => p.id === id);
    this.state.svgPoint = document.querySelector('#app svg').createSVGPoint();
    this.state.currentPoint = allPaths[selectedPathIndex].definition[this.state.selectedPointIndex].dest;
  },

  updatePathCenter(bbox) {
    let center = {
      x: bbox.x + bbox.width/2,
      y: bbox.y + bbox.height/2
    }
    this.state.allPaths[this.state.selectedPathIndex].center = center;
  },

  updateRotation(val) {
    this.state.allPaths[store.state.selectedPathIndex].rotation = val;
    this.updateRotationCenter();
    this.state.transformMatrix = window.SELECTED_PATH.getScreenCTM().inverse();
    this.historySnapshot();
  },

  updateRotationCenter() {
    let center = this.state.allPaths[this.state.selectedPathIndex].center;
    this.state.allPaths[this.state.selectedPathIndex].rotationCenter = center;
  },

  historySnapshot() {
    if (this.debug) console.log("historySnapshot");

    /* first reset the history position and clear all history arrays smaller then the current historyPos */
    if (this.state.historyPos > -1) {
      this.state.history.splice(0, this.state.historyPos + 1);
      console.log('snapshot clear', this.state.history)
      this.state.historyPos = -1;
    }

    const copiedPaths = JSON.parse(JSON.stringify(this.state.allPaths));
    this.state.history.unshift( copiedPaths );
  },

  setHistoryPos(val) {
    if (this.debug) console.log("setHistoryPos", val);

    this.state.historyPos += val;
  },

  historyGoTo( count = 0 ) {
    if (this.debug) console.log("historyGoTo", count);
    Vue.set(this.state, 'allPaths', JSON.parse(JSON.stringify(this.state.history[count + 1])) );

    /* after time traveling selected elements have to be reset, because it is possible that they don't exist. */
    this.selectTool(this.state.tool);
    this.state.selectedPathIndex = null;
    this.state.selectedPathId = null;
    this.state.currentPoint = {};
    this.state.livePreviewSegment = {};
    this.state.selectedPointId = null;
    this.state.selectedPointStep = null;
    this.state.selectedPointIndex = null;
    this.state.isFirstPoint = true;
  },

  setStrokeLinecap(str) {
    const { selectedPathIndex } = this.state;
    this.state.allPaths[selectedPathIndex].strokeLinecap = str;
  },

  setStrokeLinejoin(str) {
    const { selectedPathIndex } = this.state;
    this.state.allPaths[selectedPathIndex].strokeLinejoin = str;
  },

  setStrokeWidth(n) {
    const { selectedPathIndex } = this.state;
    this.state.allPaths[selectedPathIndex].strokeWidth = n;
  },

  joinPoints(pathIndex) {
    let closeSegment = Object.assign({}, this.state.allPaths[pathIndex].definition[0]);
    closeSegment.type = 'Z';
    closeSegment.dest = {};
    closeSegment.id = new Date().getTime();
    this.state.allPaths[pathIndex].definition.push(closeSegment);
  }

};

export default store;
