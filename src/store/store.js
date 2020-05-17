/*const testPaths = [
  {
    id: 1,
    rotation: 10,
    definition: [
      { id: 1, type: "M", dest: { x: 10, y: 10 } },
      { id: 2, type: "L", dest: { x: 8, y: 15 } },
      { id: 3, type: "L", dest: { x: 2, y: 0 } }
    ]
  },
  {
    id: 2,
    rotation: null,
    definition: [
      { id: 4, type: "M", dest: { x: 17, y: 90 } },
      { id: 5, type: "L", dest: { x: 87, y: 15 } },
      { id: 6, type: "L", dest: { x: 20, y: 5 } }
    ]
  }
];*/


function emptyPath() {
  return {
    id: Date.now(),
    definition: [],
    rotation: null,
    center: {},
    rotationCenter: {}
  }
}

const store = {
  debug: true,
  state: {
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

    console.log(tool)
    if (tool === 'PEN' && this.state.selectedPathIndex === null) {
      console.log('hae?')
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
      this.state.livePreviewSegment = {type: 'L', dest: {x: point.x, y: point.y}};
    }

    /* moving point */
    if (this.state.movePoint) {
      let point = this.state.svgPoint;
      point.x = event.clientX;
      point.y = event.clientY;
      point = point.matrixTransform(this.state.transformMatrix);

      /* this moves the current selected point */
      this.state.allPaths[this.state.selectedPathIndex].definition[this.state.selectedPointIndex][this.state.selectedPointStep] = {x: point.x, y: point.y};
    }
  },

  handleMouseUp() {
    let {allPaths, selectedPathIndex, selectedPointIndex} = this.state;

    this.state.movePoint = false;

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
    this.state.currentPoint = {x: point.x, y: point.y};

    if (where === 'END') {
      let id = Date.now();

      allPaths[selectedPathIndex].definition.push({
        type: 'L',
        id: id,
        dest: {
          x: point.x,
          y: point.y
        }
      })
      this.state.selectedPointId = id;
      this.state.selectedPointIndex++;
    }
    if (where === 'START') {
      let id = Date.now();

      allPaths[selectedPathIndex].definition.unshift({
        type: 'M',
        id: id,
        dest: {
          x: point.x,
          y: point.y
        }
      })
      allPaths[selectedPathIndex].definition[selectedPointIndex + 1].type = 'L';
      this.state.selectedPointId = id;
    }
    if ( where === "NEW" ) {
      let id = Date.now();
      this.state.allPaths[this.state.selectedPathIndex].definition.push({
        type: 'M',
        id: id,
        dest: {
          x: point.x,
          y: point.y
        }
      })
      this.state.selectedPointId = id;
      this.state.selectedPointIndex = 0;
    } 
  },

  deleteSegment() {
    if (this.debug) console.log("deleteSegment");
    if (this.state.selectedPointIndex) {
      console.log(this.state.allPaths[this.state.selectedPathIndex].definition[this.state.selectedPointIndex])
      delete this.state.allPaths[this.state.selectedPathIndex].definition.splice(this.state.selectedPointIndex, 1);

      /* clear selected path */
      this.state.selectedPointIndex = null;
      this.state.selectedPointId = null;
    }
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

  updateRotationCenter() {
    let center = this.state.allPaths[this.state.selectedPathIndex].center;
    this.state.allPaths[this.state.selectedPathIndex].rotationCenter = center;
  }

};

export default store;
