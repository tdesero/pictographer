import Vue from 'vue';
import createCircle from './shapes/createCircle';
import createStar from './shapes/createStar';
import createSVG from './createSVG';

window.SELECTED_PATH = {};

/* polyfill */
SVGElement.prototype.getTransformToElement = SVGElement.prototype.getTransformToElement ||        function(toElement) {

  return toElement.getScreenCTM().inverse().multiply(this.getScreenCTM());

};

function emptyPath() {
  return {
    id: new Date().getTime(),
    definition: [],
    isClosed: false,
    rotation: null,
    scale: {x: 1, y: 1},
    bbox: {},
    center: {},
    rotationCenter: {},
    translate: {x: null, y: null},
    strokeLinecap: 'butt',
    strokeLinejoin: 'miter',
    strokeWidth: 2,
    hasFill: false, 
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
    isMovingPoint: false,
    isMovingPath: false,
    clientStartPos: {},
    movePathStartPos: {}, //stores the path definition (all segments)
    svgPoint: {},
    isFirstPoint: true,
    isDrawing: false,
    nextCurve: {},
    currentSegment: 'L',
    snapToGrid: true,
    hideControls: false,
    viewBox: {x: 24, y: 24},
    //clientMovePos: {},
    svgCode: '',
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
   * 'PEN', 'CIRCLE', 'RECT', 'EDIT', 'BBOX', 'NONE'
   * @param {string} tool
   * @public
   */
  selectTool(tool) {
    if (this.debug) console.log("selectTool", tool);
    this.state.tool = tool;

    if (tool === 'PEN') {
      this.state.isFirstPoint = true;
    }
  },

  /**
   * handle mousedown depending on selected tool
   * expects the dom element of the currently selected path
   * if no path selected it can be called with "null" instead
   * @param {object} event
   * @param {array} domElement
   * @public
   */
  handleMouseDown(event, domElement) {
    if (this.debug) console.log("handleMouseDown");
    const { selectedPointIndex, selectedPathIndex } = this.state;
    let pathLength;

    if (domElement) {
      this.state.transformMatrix = domElement.getScreenCTM().inverse();
    }
    this.state.svgPoint = document.querySelector('#app svg').createSVGPoint();

    /* Tracking the point for path moving */
    let point = this.state.svgPoint;
    point.x = event.clientX;
    point.y = event.clientY;
    point = point.matrixTransform(this.state.transformMatrix);
    if (this.state.snapToGrid) { point = roundPoint(point) }

    this.state.clientStartPos = {x: point.x, y: point.y};
    
    if (selectedPathIndex !== null) {
      this.state.movePathStartPos = JSON.parse(JSON.stringify(this.state.allPaths[selectedPathIndex].definition));
      pathLength = this.state.allPaths[selectedPathIndex].definition.length;
    }

    switch(this.state.tool) {   
      case 'PEN':
        this.state.isDrawing = true;
        if( ((pathLength - 1) === selectedPointIndex)
            && !this.state.isFirstPoint) {
          if (this.debug) console.log('end')

          this.addSegment(event, 'END');

        } else if( (selectedPointIndex === 0)
                    && !this.state.isFirstPoint) {
          if (this.debug) console.log('start')

          this.addSegment(event, 'START');

        } else if (this.state.isFirstPoint) {
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
    if (this.state.tool === 'PEN' && !this.state.isMovingPoint) {
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
      let dest = allPaths[selectedPathIndex].definition[selectedPointIndex].dest;
      let oldCurve = {}

      let point = this.state.svgPoint;
      point.x = event.clientX;
      point.y = event.clientY;
      point = point.matrixTransform(this.state.transformMatrix);
      if (snapToGrid) { point = roundPoint(point) }

      //subtract the difference to have a more intuitive curve while drawing
      point.x = dest.x - (point.x - dest.x);
      point.y = dest.y - (point.y - dest.y);

      if (selectedPointIndex === 0) {
        /* this is a bit confusing: as the new point is added at the beginning, the actual point is just a M (Moveto) Point with x,y coordinates. 
         * So the origin is taken from the segment at index 1 and the curve is calculated from the segment at index 2 */
        let from = allPaths[selectedPathIndex].definition[1];
        let from2 = allPaths[selectedPathIndex].definition[2];
        oldCurve.x = from.dest.x - (from2.curve1.x - from.dest.x) || from.dest.x;
        oldCurve.y = from.dest.y - (from2.curve1.y - from.dest.y) || from.dest.y;

        allPaths[selectedPathIndex].definition[1].type = 'C';
        allPaths[selectedPathIndex].definition[1].curve1 = { x: point.x, y: point.y };
        allPaths[selectedPathIndex].definition[1].curve2 = { x: oldCurve.x, y: oldCurve.y }
      } else {
        let from = allPaths[selectedPathIndex].definition[selectedPointIndex - 1];
        oldCurve.x = from.dest.x - (from.curve2.x - from.dest.x) || from.dest.x;
        oldCurve.y = from.dest.y - (from.curve2.y - from.dest.y) || from.dest.y;

        allPaths[selectedPathIndex].definition[selectedPointIndex].type = 'C';
        allPaths[selectedPathIndex].definition[selectedPointIndex].curve1 = { x: oldCurve.x, y: oldCurve.y };
        allPaths[selectedPathIndex].definition[selectedPointIndex].curve2 = { x: point.x, y: point.y }
      }
      
    }

    /* moving point */
    if (this.state.isMovingPoint) {
      const {selectedPathIndex, selectedPointIndex, selectedPointStep, allPaths, movePathStartPos} = this.state;
      let point = this.state.svgPoint;
      point.x = event.clientX;
      point.y = event.clientY;
      point = point.matrixTransform(this.state.transformMatrix);
      if (this.state.snapToGrid) { point = roundPoint(point) }

      /* this moves the current selected point */
      allPaths[selectedPathIndex].definition[selectedPointIndex][selectedPointStep] = {x: point.x, y: point.y};

      if ( (selectedPointStep === 'dest') && !event.altKey) {
        /* move the curve handles together with the destination point (IMPORTANT: IF ALT KEY IS NOT PRESSED!) */
        let diff = {};
        const type = allPaths[selectedPathIndex].definition[selectedPointIndex].type;
        const nextType = allPaths[selectedPathIndex].definition[selectedPointIndex + 1] ? allPaths[selectedPathIndex].definition[selectedPointIndex + 1].type : null;
        diff.x = point.x - this.state.clientStartPos.x;
        diff.y = point.y - this.state.clientStartPos.y;
        if ( type === 'C') {
          allPaths[selectedPathIndex].definition[selectedPointIndex].curve2.x = movePathStartPos[selectedPointIndex].curve2.x + diff.x;
          allPaths[selectedPathIndex].definition[selectedPointIndex].curve2.y = movePathStartPos[selectedPointIndex].curve2.y + diff.y;
        }
        if (nextType === 'C') {
          allPaths[selectedPathIndex].definition[selectedPointIndex + 1].curve1.x = movePathStartPos[selectedPointIndex + 1].curve1.x + diff.x;
          allPaths[selectedPathIndex].definition[selectedPointIndex + 1].curve1.y = movePathStartPos[selectedPointIndex + 1].curve1.y + diff.y;
        }
      }
    }

    /* moving path */
    if (this.state.tool === 'SELECT' && this.state.isMovingPath) {
      const { movePathStartPos } = this.state;
      let diff = {};
      let point = this.state.svgPoint;
      point.x = event.clientX;
      point.y = event.clientY;
      point = point.matrixTransform(this.state.transformMatrix);
      if (this.state.snapToGrid) { point = roundPoint(point) }

      diff.x = point.x - this.state.clientStartPos.x;
      diff.y = point.y - this.state.clientStartPos.y;

      this.state.allPaths[this.state.selectedPathIndex].definition.forEach((s, index) => {
        if (s.type === 'Z') return;
        s.dest.x = movePathStartPos[index].dest.x + diff.x;
        s.dest.y = movePathStartPos[index].dest.y + diff.y;

        if (s.curve1.x !== undefined) {
          s.curve1.x = movePathStartPos[index].curve1.x + diff.x;
          s.curve1.y = movePathStartPos[index].curve1.y + diff.y;
        }
        if (s.curve2.x !== undefined) {
          s.curve2.x = movePathStartPos[index].curve2.x + diff.x;
          s.curve2.y = movePathStartPos[index].curve2.y + diff.y;
        }
      })
    }
  },

  handleMouseUp() {
    let {allPaths, selectedPathIndex, selectedPointIndex} = this.state;

    /* if a point or path was moved add it to history */
    if (this.state.isMovingPoint || this.state.isMovingPath || this.state.isDrawing) {
      this.historySnapshot()
    }

    this.state.isMovingPoint = false;
    this.state.isMovingPath = false;

    this.state.isDrawing = false;

    if (selectedPathIndex !== null) {
      this.updateBBox();
      this.updatePathCenter(allPaths[selectedPathIndex].bbox);
      //this.updateRotationCenter();
    }

    if (selectedPathIndex !== null && selectedPointIndex !== null) {
      this.state.currentPoint = allPaths[selectedPathIndex].definition[selectedPointIndex].dest;
    }

  },

  /* TODO where = 'END' || 'START' || 'NEW' */
  addSegment(event, where) {
    if (this.debug) console.log("addSegment", where);

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
      this.state.selectedPointIndex = 0;
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
    
    /* update bbox according to the new point */
    if (window.SELECTED_PATH) {
      let bbox = window.SELECTED_PATH.getBBox();
      this.updateBBox()
      this.updatePathCenter(bbox);
      this.updateRotationCenter();
    }

    this.historySnapshot();
  },

  continuePath(pathId, pathIndex, segmentId, segmentIndex) {
    if (this.debug) console.log('continuePath');

    this.state.selectedPathId = pathId;
    this.state.selectedPathIndex = pathIndex;
    this.state.selectedPointId = segmentId;
    this.state.selectedPointIndex = segmentIndex;

    this.state.isFirstPoint = false;
  },

  deleteAction() {
    if (this.debug) console.log("delete");
    const { tool } = this.state;

    if (tool === "PEN" || tool === "EDIT") {
      this.deleteSegment();
    } else if (tool === "SELECT") {
      this.deletePath();
    }
    this.historySnapshot();
  },

  deletePath() {
    const {selectedPathIndex} = this.state;

    if (selectedPathIndex !== null) {
      this.state.allPaths.splice(selectedPathIndex, 1);
      this.unselectPath();
    }
  },

  deleteSegment() {
    if (this.debug) console.log("deleteSegment");

    let {selectedPointIndex, selectedPathIndex} = this.state;

    if (selectedPointIndex !== null) {
      if ( selectedPointIndex === 0 ) {

        if (this.state.allPaths[selectedPathIndex].definition.length > 1) {
          /* make the recent first point moveto ('M') instead of lineto ('L') */
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
    this.updateBBox();
  },

  selectPath(id, index) {
    if (this.debug) console.log("selectPath", id, index);
    const { tool } = this.state;
    this.updateBBox();

    if (tool === "EDIT" || tool === "SELECT") {
      if (this.state.selectedPathId !== id) {
        this.unselectPoint();
      }
      this.state.selectedPathId = id;
      this.state.selectedPathIndex = index;
    }
  },

  unselectPath() {
    if (this.debug) console.log("unselectPath");
    this.state.selectedPathId = null
    this.state.selectedPathIndex = null;
  },

  unselectPoint() {
    this.state.selectedPointIndex = null;
    this.state.selectedPointId = null;
  },

  /* TODO */
  setSelectedPoint(id, step) {
    let { allPaths, selectedPathIndex} = this.state;

    this.state.isMovingPoint = true;
    this.state.selectedPointId = id;
    this.state.selectedPointStep = step;
    this.state.selectedPointIndex = allPaths[selectedPathIndex].definition.findIndex(p => p.id === id);
    this.state.svgPoint = document.querySelector('#app svg').createSVGPoint();
    this.state.currentPoint = allPaths[selectedPathIndex].definition[this.state.selectedPointIndex].dest;
  },

  addCircle(center, radius) {
    const d = createCircle(center, radius);
    
    this.createPath();
    this.state.allPaths[this.state.selectedPathIndex].definition = d;
    this.state.allPaths[this.state.selectedPathIndex].isClosed = true;
    this.historySnapshot();
  },

  addStar(center, outerRadius, innerRadius, arms) {
    const d = createStar(center, outerRadius, innerRadius, arms);
    
    this.createPath();
    this.state.allPaths[this.state.selectedPathIndex].definition = d;
    this.state.allPaths[this.state.selectedPathIndex].isClosed = true;
    this.historySnapshot();
  },

  updateBBox() {
    const { selectedPathIndex } = this.state;
    if (window.SELECTED_PATH && selectedPathIndex) {
      const bbox = window.SELECTED_PATH.getBBox();
      this.state.allPaths[selectedPathIndex].bbox = bbox;
      this.updatePathCenter(bbox);
    }
    if (this.debug) { console.log('updateBBox');}
  },

  updatePathCenter(bbox) {
    const { selectedPathIndex } = this.state;
    let center = {
      x: bbox.x + bbox.width/2,
      y: bbox.y + bbox.height/2
    }
    this.state.allPaths[selectedPathIndex].center = center;
  },

  updateRotation(val) {
    this.state.allPaths[this.state.selectedPathIndex].rotation = val;
    this.updateRotationCenter();
    this.state.transformMatrix = window.SELECTED_PATH.getScreenCTM().inverse();
  },

  updateRotationCenter() {
    /* rotation Center is different from the regulat center. It is defined by the parent Elements BBox because otherwise the existing (rotation) transforms would be ignored */
    let center = this.state.allPaths[this.state.selectedPathIndex].center;
    this.state.allPaths[this.state.selectedPathIndex].rotationCenter = center;
  },

  bakeRotation() {
    let pathIndex = this.state.selectedPathIndex;
    //const svg = document.querySelector('#app svg')
    const {rotationCenter, rotation} = this.state.allPaths[pathIndex];

    function rotatePoint(p, cx, cy, angle) {
      let pi = Math.PI;
      let s = Math.sin(angle * (pi/180)); //radians needed
      let c = Math.cos(angle * (pi/180)); //radians needed

      // translate point back to origin:
      p.x -= cx;
      p.y -= cy;

      // rotate point
      let xnew = p.x * c - p.y * s;
      let ynew = p.x * s + p.y * c;

      // translate point back:
      p.x = xnew + cx;
      p.y = ynew + cy;
      return p;
    }

    this.state.allPaths[pathIndex].definition.forEach(s => {
      if (s.type === "C") {
        s.curve1 = rotatePoint( s.curve1, rotationCenter.x,  rotationCenter.y, rotation);  
        s.curve2 = rotatePoint( s.curve2, rotationCenter.x,  rotationCenter.y, rotation);
      }
      s.dest = rotatePoint( s.dest, rotationCenter.x,  rotationCenter.y, rotation);
    })
    this.state.allPaths[this.state.selectedPathIndex].rotation = 0;
    this.state.transformMatrix = window.SELECTED_PATH.getScreenCTM().inverse();

    this.updateBBox();
    this.historySnapshot();
  },

  updateScale(scaleX, scaleY) {
    const { center } = this.state.allPaths[this.state.selectedPathIndex];
    const oldScale = this.state.allPaths[this.state.selectedPathIndex].scale;

    function calcScale(val, center, scale) {
      let p = val - center; // get a vector to v relative to the centerpoint
      p = p * scale; // scale the cp-relative-vector
      p = p + center; // translate the scaled vector back
      return p;
    } 

    this.state.allPaths[this.state.selectedPathIndex].definition.forEach(s => {
      if (s.type === "C") {
        s.curve1.x = calcScale(s.curve1.x, center.x, scaleX/oldScale.x);
        s.curve1.y = calcScale(s.curve1.y, center.y, scaleY/oldScale.y);
        s.curve2.x = calcScale(s.curve2.x, center.x, scaleX/oldScale.x);
        s.curve2.y = calcScale(s.curve2.y, center.y, scaleY/oldScale.y);
      }
      s.dest.x = calcScale(s.dest.x, center.x, scaleX/oldScale.x);
      s.dest.y = calcScale(s.dest.y, center.y, scaleY/oldScale.y);
    })
    this.state.allPaths[this.state.selectedPathIndex].scale.x = scaleX;
    this.state.allPaths[this.state.selectedPathIndex].scale.y = scaleY;
    this.state.transformMatrix = window.SELECTED_PATH.getScreenCTM().inverse();
  },

  resetScale() {
    this.state.allPaths[this.state.selectedPathIndex].scale.x = 1;
    this.state.allPaths[this.state.selectedPathIndex].scale.y = 1;
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
    this.state.allPaths[pathIndex].isClosed = true;
  },

  copyPath() {
    const {selectedPathIndex} = this.state;
    const copiedPath = JSON.parse(JSON.stringify(this.state.allPaths[selectedPathIndex]));
    copiedPath.id = new Date().getTime();

    this.state.allPaths.push(copiedPath);

    this.selectPath(copiedPath.id, this.state.allPaths.length - 1);
    this.unselectPoint();
  },

  splitSegment(distance) {
    const {allPaths, selectedPointIndex, selectedPathIndex} = this.state
    const selectedPointType = allPaths[selectedPathIndex].definition[selectedPointIndex].type;

    if (selectedPointType === 'C') {
      this.splitCurve(distance);
    } else if (selectedPointType === 'L') {
      this.splitLine(distance);
    }
  },

  splitLine(distance) {
    if (this.debug) console.log('splitLine', distance);
    let id = new Date().getTime();
    let dist = distance || 0.5;
    const {selectedPathIndex, selectedPointIndex} = this.state;
    const seg = this.state.allPaths[selectedPathIndex].definition[selectedPointIndex];
    let newSeg;

    //the original 2 points defining the bezier curve
    const a = this.state.allPaths[selectedPathIndex].definition[selectedPointIndex-1].dest;
    const b = seg.dest;

    newSeg = {
      type: 'L',
      id: id,
      curve1: {},
      curve2: {},
      dest: {x: b.x,y: b.y}
    }
    this.state.allPaths[selectedPathIndex].definition.splice(selectedPointIndex + 1, 0, newSeg);

    b.x = a.x + (b.x - a.x) * dist;
    b.y = a.y + (b.y - a.y) * dist;

    // set the selected Point to the new created (this is better while drawing)
    this.state.selectedPointId = id;
    this.state.selectedPointIndex = selectedPointIndex + 1;

    this.state.currentPoint = this.state.allPaths[selectedPathIndex].definition[selectedPointIndex + 1].dest;
  },

  /** 
   * splitCurve
   * @param {number} dist
   * dist is the distance between the two points in a range from 0.0 to 1.0
  */
  splitCurve(distance) {
    if (this.debug) console.log('splitCurve', distance);
    let id = new Date().getTime();
    /* see: https://stackoverflow.com/questions/18655135/divide-bezier-curve-into-two-equal-halves/18681336#18681336 */

    let dist = distance || 0.5;
    const {selectedPathIndex, selectedPointIndex} = this.state;
    const seg = this.state.allPaths[selectedPathIndex].definition[selectedPointIndex];
    let newSeg;

    //the original 4 points defining the bezier curve
    const a = this.state.allPaths[selectedPathIndex].definition[selectedPointIndex-1].dest;
    const b = seg.curve1;
    const c = seg.curve2;
    const d = seg.dest;

    //the new points
    let e, f, g, h, j, k;

    function calc(p1, p2) {
      const p3 = {};
      p3.x = (p1.x + p2.x) * dist;
      p3.y = (p1.y + p2.y) * dist;
      return p3;
    }

    e = calc(a, b);
    f = calc(b, c);
    g = calc(c, d);
    h = calc(e, f);
    j = calc(f, g);
    k = calc(h, j);

    newSeg = {
      type: 'C',
      id: id,
      curve1: {x: j.x, y: j.y},
      curve2: {x: g.x, y: g.y},
      dest: {x: d.x,y: d.y}
    }
    this.state.allPaths[selectedPathIndex].definition.splice(selectedPointIndex + 1, 0, newSeg);

    // mutating the original segment object should be done after
    seg.curve1.x = e.x;
    seg.curve1.y = e.y;
    seg.curve2.x = h.x;
    seg.curve2.y = h.y;
    seg.dest.x = k.x;
    seg.dest.y = k.y;

    // set the selected Point to the new created (this is better while drawing)
    this.state.selectedPointId = id;
    this.state.selectedPointIndex = selectedPointIndex + 1;

    this.state.currentPoint = this.state.allPaths[selectedPathIndex].definition[selectedPointIndex + 1].dest;
  },

  createSVG() {
    /* imported function: */
    store.state.svgCode = createSVG();
  },

  exportSVG() {
    /* this actually doesn't store anything inside the state */
    const svgCode = createSVG();
    const blob = new Blob([svgCode], {type: "image/svg+xml"});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = 'export.svg';
    a.click();
  }
};

export default store;
