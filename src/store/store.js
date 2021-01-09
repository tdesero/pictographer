import Vue from 'vue';
import createCircle from './shapes/createCircle';
import createStar from './shapes/createStar';
import { Path } from './classes/Path';
import { initialState } from './initialState';

// utilities & helpers
import { roundPoint } from './util/roundPoint';
import { createSVG } from './util/createSVG';
import { exportSVG } from './util/exportSVG';
import { polyfill } from './util/polyfill';
import { clone } from './util/clone';
import { cloneDeep } from 'lodash';

polyfill();

// this is bad practice i guess but i need this globally every now and then:
window.SELECTED_PATH = undefined;

// define all Tools as Constants
const TOOLS = {
  PEN: 'PEN',
  EDIT: 'EDIT',
  SELECT: 'SELECT',
  RECT: 'RECT',
}

const HISTORY_MAX = 30;

// store
const store = {
  debug: true,
  state: initialState,

  /**
   * Create empty path.
   * @public
   */
  createPath() {
    if (this.debug) console.log("createPath");

    this.state.allPaths.push(new Path());
    this.state.selectedPathIndex = this.state.allPaths.length - 1;
    this.state.selectedPathId = this.getPath().id;

    /* clear currentPoint */
    this.state.isFirstPoint = true;

    if (this.debug) console.log("index:", this.state.selectedPathIndex);
    if (this.debug) console.log("id:", this.state.selectedPathId);
  },

  /**
   * select tool
   * @param {string} tool
   * @public
   */
  selectTool(tool) {
    if (this.debug) console.log("selectTool", tool);
    this.state.tool = tool;

    if ((tool === TOOLS.PEN) ||
        (tool === TOOLS.RECT)) {
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
      this.state.movePathStartPos = JSON.parse(JSON.stringify(this.getPath().definition));
      pathLength = this.getPath().definition.length;

      this.updateBBox();
    }

    switch(this.state.tool) {   
      case TOOLS.PEN:
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

          this.createPath();
          this.addSegment(event, 'NEW');
        }
        break;
      case TOOLS.RECT:
        this.createPath();

        // Initialize the Segments
        this.addSegment(event, 'NEW');
        this.addSegment(event, 'END');
        this.addSegment(event, 'END');
        this.addSegment(event, 'END');
        // Back to the starting point
        this.addSegment(event, 'END');
        this.getPath().isClosed = true;
        this.state.isDrawing = true;
        break;
      case TOOLS.SELECT:
        this.state.isSelecting = true;
        break;
      default:
        return;
    }
  },

  /* TODO */
  handleMouseMove(event) {
    // if (this.debug) console.log("handleMouseMove");

    if (this.state.tool === TOOLS.PEN && !this.state.isMovingPoint) {
      if (!this.getPath()) return;
      if (this.getPath().definition.length === 0) return;
      let point = this.state.svgPoint;
      point.x = event.clientX;
      point.y = event.clientY;
      point = point.matrixTransform(this.state.transformMatrix);
      if (this.state.snapToGrid) { point = roundPoint(point) }

      this.state.livePreviewSegment = {type: 'L', dest: {x: point.x, y: point.y}};
    }

    if (this.state.tool === TOOLS.PEN && this.state.isDrawing) {
      this.drawBezier(event);
    }

    if (this.state.tool === TOOLS.RECT && this.state.isDrawing) {
      this.drawRect(event);
    }

    if (this.state.isMovingPoint) {
      this.movePoint(event);
    }

    if (this.state.tool === TOOLS.SELECT && this.state.isMovingPath) {
      this.movePath(event);
    }

    if (this.state.tool === TOOLS.SELECT && this.state.isSelecting && !this.state.isMovingPath) {
      this.drawSelectionRect(event);
    } else {
      this.state.isSelecting = false;
    }
  },

  handleMouseUp() {
    let {selectedPathIndex, selectedPointIndex} = this.state;

    /* if a point or path was moved add it to history */
    if (this.state.isMovingPoint || this.state.isMovingPath || this.state.isDrawing) {
      this.historySnapshot();
    }

    this.state.isMovingPoint = false;
    this.state.isMovingPath = false;
    this.state.isDrawing = false;
    this.state.selectionRect = {};
    console.log('selectionRect is empty')

    // this should be set a bit later so the click event still knows that there was a selection
    setTimeout(() => {
      this.state.isSelecting = false;
    }, 100);

    if (selectedPathIndex !== null) {
      this.updateBBox();
      this.updatePathCenter(this.getPath().bbox);
    }

    if (selectedPathIndex !== null && selectedPointIndex !== null) {
      this.state.currentPoint = this.getSegment().dest;
    }

  },

  drawBezier(event) {
    let { selectedPathIndex, selectedPointIndex, snapToGrid } = this.state;
    let dest = this.getPath().definition[selectedPointIndex].dest;
    let oldCurve = {};
  
    let point = this.state.svgPoint;
    point.x = event.clientX;
    point.y = event.clientY;
    point = point.matrixTransform(this.state.transformMatrix);
    if (snapToGrid) { point = roundPoint(point); }
  
    // subtract the difference to have a more intuitive curve while drawing
    point.x = dest.x - (point.x - dest.x);
    point.y = dest.y - (point.y - dest.y);
  
    if (selectedPointIndex === 0) {
      /* this is a bit confusing: as the new point is added at the beginning, the actual point is just a M (Moveto) Point with x,y coordinates.
       * So the origin is taken from the segment at index 1 and the curve is calculated from the segment at index 2 */
      let from = this.getSegment(selectedPathIndex, 1);
      let from2 = this.getSegment(selectedPathIndex, 2);
      oldCurve.x = from.dest.x - (from2.curve1.x - from.dest.x) || from.dest.x;
      oldCurve.y = from.dest.y - (from2.curve1.y - from.dest.y) || from.dest.y;
  
      this.updateType('C', selectedPathIndex, 1);
      this.updateCurve1({ x: point.x, y: point.y }, selectedPathIndex, 1);
      this.updateCurve2({ x: oldCurve.x, y: oldCurve.y }, selectedPathIndex, 1);
    } else {
      let from = this.getSegment(selectedPathIndex, selectedPointIndex - 1);
      oldCurve.x = from.dest.x - (from.curve2.x - from.dest.x) || from.dest.x;
      oldCurve.y = from.dest.y - (from.curve2.y - from.dest.y) || from.dest.y;
  
      this.updateType('C');
      this.updateCurve1({ x: oldCurve.x, y: oldCurve.y });
      this.updateCurve2({ x: point.x, y: point.y });
    }
  },

  drawRect(event) {
    let { snapToGrid, selectedPathIndex } = this.state;
    let point = this.state.svgPoint;
    point.x = event.clientX;
    point.y = event.clientY;
    point = point.matrixTransform(this.state.transformMatrix);
    if (snapToGrid) { point = roundPoint(point); }

    let firstPoint = this.getSegment(selectedPathIndex, 0).dest;
    // add Shift functionality 
    if (event.shiftKey) {
      console.log('shift');
      // make it dependant on x
      const dist = point.x - firstPoint.x;
      const correctedY = firstPoint.y + dist;
      this.updateDest({x: firstPoint.x, y: correctedY}, selectedPathIndex, 1);
      this.updateDest({x: point.x, y: correctedY}, selectedPathIndex, 2);
      this.updateDest({x: point.x, y: firstPoint.y}, selectedPathIndex, 3);
    } else {
      this.updateDest({x: firstPoint.x, y: point.y}, selectedPathIndex, 1);
      this.updateDest({x: point.x, y: point.y}, selectedPathIndex, 2);
      this.updateDest({x: point.x, y: firstPoint.y}, selectedPathIndex, 3);
    }
  },

  drawSelectionRect(event) {
    const { selectionRect, allPaths } = this.state;
    let point = this.state.svgPoint;
    point.x = event.clientX;
    point.y = event.clientY;
    point = point.matrixTransform(this.state.transformMatrix);

    const startPoint = this.state.clientStartPos;
    let width = point.x - startPoint.x;
    let height = point.y - startPoint.y;
    let x = startPoint.x; 
    let y = startPoint.y;
    if (width < 0) {
      width = Math.abs(width);
      x = point.x;
    }
    if (height < 0) {
      height = Math.abs(height);
      y = point.y;
    }

    this.state.selectionRect = {
      x,
      y,
      width,
      height,
    };

    allPaths.forEach( (path, index) => {
      const RectA = {
        Left: selectionRect.x,
        Right: selectionRect.x + selectionRect.width,
        Top: selectionRect.y,
        Bottom: selectionRect.y + selectionRect.height,
      }
      const RectB = {
        Left: path.bbox.x,
        Right: path.bbox.x + path.bbox.width,
        Top: path.bbox.y,
        Bottom: path.bbox.y + path.bbox.height,
      }
      if (RectA.Left < RectB.Right && RectA.Right > RectB.Left &&
        RectA.Bottom > RectB.Top && RectA.Top < RectB.Bottom ) {
          this.addToMultiSelect(index);
      }
    })
  },

  movePoint(event) {
    const {selectedPathIndex, selectedPointIndex, selectedPointStep, movePathStartPos} = this.state;
      let point = this.state.svgPoint;
      point.x = event.clientX;
      point.y = event.clientY;
      point = point.matrixTransform(this.state.transformMatrix);
      if (this.state.snapToGrid) { point = roundPoint(point) }

      /* this moves the current selected point */
      this.getSegment()[selectedPointStep] = {x: point.x, y: point.y};

      if ( (selectedPointStep === 'dest') && !event.altKey) {
        /* move the curve handles together with the destination point (if ALT-key is not pressed) */
        let diff = {};
        const type = this.getSegment().type;
        const nextSegment = this.getSegment(selectedPathIndex, selectedPointIndex + 1);
        const nextType = nextSegment ? nextSegment.type : null;
        diff.x = point.x - this.state.clientStartPos.x;
        diff.y = point.y - this.state.clientStartPos.y;
        if ( type === 'C') {
          const x = movePathStartPos[selectedPointIndex].curve2.x + diff.x;
          const y = movePathStartPos[selectedPointIndex].curve2.y + diff.y;
          this.updateCurve2({x, y});
        }
        if (nextType === 'C') {
          const x = movePathStartPos[selectedPointIndex + 1].curve1.x + diff.x;
          const y = movePathStartPos[selectedPointIndex + 1].curve1.y + diff.y;
          this.updateCurve1({x, y}, selectedPathIndex, selectedPointIndex + 1);
        }
      }
  },

  movePath(event) {
    // method supports multiple paths to be moved
    const { multiSelectedPaths } = this.state;
    this.state.isMovingPath = true;
    let diff = {};
    let point = this.state.svgPoint;
    point.x = event.clientX;
    point.y = event.clientY;
    point = point.matrixTransform(this.state.transformMatrix);
    if (this.state.snapToGrid) { point = roundPoint(point) }

    diff.x = point.x - this.state.clientStartPos.x;
    diff.y = point.y - this.state.clientStartPos.y;

    if (multiSelectedPaths.length > 1) {
      for (let i = 0; i < multiSelectedPaths.length; i++) {
        const pathIndex = multiSelectedPaths[i];
        this.movePathByPx(this.getPath(pathIndex), diff.x, diff.y);
      }
    } else {
      const path = this.getPath();
      this.movePathByPx(path, diff.x, diff.y);
    }
    this.state.clientStartPos.x = point.x;
    this.state.clientStartPos.y = point.y;
  },

  movePathByPx(path, x, y) {
    // px unit is relative to viewBox
    if (!path) return;
    path.definition.forEach((s) => {
      if (s.type === 'Z') return;
      s.dest.x += x;
      s.dest.y += y;

      if (s.curve1.x !== undefined) {
        s.curve1.x += x;
        s.curve1.y += y;
      }
      if (s.curve2.x !== undefined) {
        s.curve2.x += x;
        s.curve2.y += y;
      }
    })
  },

  /* where = 'END' || 'START' || 'NEW' */
  addSegment(event, where) {
    if (this.debug) console.log("addSegment", where);

    let { selectedPointIndex } = this.state;

    // create new SVG Point
    let point = document.querySelector('#app svg').createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    point = point.matrixTransform(this.state.transformMatrix);
    if (this.state.snapToGrid) { point = roundPoint(point) }

    this.state.currentPoint = {x: point.x, y: point.y};

    if (where === 'END') {
      const id = this.getPath().addSegment({
        type: 'L',
        dest: {
          x: point.x,
          y: point.y
        }
      })
      this.state.selectedPointId = id;
      this.state.selectedPointIndex++;
    }
    if (where === 'START') {
      const id = this.getPath().addSegmentAtStart({
        type: 'M',
        dest: {
          x: point.x,
          y: point.y
        }
      })
      this.getPath().definition[selectedPointIndex + 1].type = 'L';
      this.state.selectedPointId = id;
      this.state.selectedPointIndex = 0;
    }
    if ( where === 'NEW' ) {
      const id = this.getPath().addSegment({
        type: 'M',
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

    if (tool === TOOLS.PEN || tool === TOOLS.EDIT) {
      this.deleteSegment();
    } else if (tool === TOOLS.SELECT) {
      this.deletePath();
    }
    this.historySnapshot();
  },

  deletePath(pathIndex) {
    pathIndex = pathIndex || this.state.selectedPathIndex;

    if (pathIndex !== null) {
      this.state.allPaths.splice(pathIndex, 1);
      this.unselectPath();
    }
  },

  deleteSegment(pathIndex, segmentIndex) {
    if (this.debug) console.log("deleteSegment");
    segmentIndex = segmentIndex || this.state.selectedPointIndex;
    pathIndex = pathIndex || this.state.selectedPathIndex;

    if (segmentIndex !== null) {
      if ( segmentIndex === 0 ) {

        if (this.getPath().definition.length > 1) {
          /* make the recent first point moveto ('M') instead of lineto ('L') */
          this.updateType('M', pathIndex, 1);
          this.updateCurve1({}, pathIndex, 1);
          this.updateCurve2({}, pathIndex, 1);
        }
        
      }
      this.getPath().definition.splice(this.state.selectedPointIndex, 1);

      /* clear selected path */
      this.state.selectedPointIndex = null;
      this.state.selectedPointId = null;
    }
    this.updateBBox();
  },

  splitPath(pathIndex, segmentIndex, deleteSegment) {
    pathIndex = pathIndex || this.state.selectedPathIndex;
    segmentIndex = segmentIndex || this.state.selectedPointIndex;
    deleteSegment = deleteSegment || true;

    const lastIndex = this.getPath(pathIndex).definition.length - 1;
    if (segmentIndex === lastIndex || segmentIndex === 0) {
      this.deleteSegment(pathIndex, segmentIndex);
      return;
    }

    const newPathDefinition = this.getPath(pathIndex).definition.splice(0, segmentIndex);
    if (deleteSegment) {
      this.getPath(pathIndex).definition.shift();
    }

    this.updateType('M', pathIndex, 0);
    this.updateCurve1({}, pathIndex, 0);
    this.updateCurve2({}, pathIndex, 0);

    if (this.getPath(pathIndex).definition.length <= 1) {
      this.deletePath(pathIndex);
    }

    if (newPathDefinition.length > 1) {
      this.state.allPaths.push( new Path(newPathDefinition) );
    }
  },

  selectPath(id, index, event) {
    if (this.debug) console.log("selectPath", id, index, event);
    const { tool } = this.state;
    event = event || {}; // if no event was provided i use

    if (tool === TOOLS.EDIT || tool === TOOLS.SELECT) {
      if (this.state.selectedPathId !== id) {
        this.unselectPoint();
      }
      this.state.selectedPathId = id;
      this.state.selectedPathIndex = index;

      const isInMultiSelection = this.state.multiSelectedPaths.indexOf(index) >= 0;
      const hasMultiSelection = this.state.multiSelectedPaths.length > 1;

      if (!event.shiftKey && !isInMultiSelection && hasMultiSelection) {
          this.state.multiSelectedPaths = [];
          this.addToMultiSelect(index);
      }
    }

    // multiselect
    if (event.shiftKey) { 
      this.addToMultiSelect(index);
    }

    this.updateBBox();
  },

  addToMultiSelect(pathIndex) {
    if (this.state.multiSelectedPaths.indexOf(pathIndex) === -1) {
      this.state.multiSelectedPaths.push(pathIndex);
      console.log('multi', this.state.multiSelectedPaths)
    }
  },

  unselectPath() {
    if (this.debug) console.log("unselectPath");
    this.state.selectedPathId = null
    this.state.selectedPathIndex = null;
    this.state.multiSelectedPaths = [];
  },

  unselectPoint() {
    if (this.debug) console.log("unselectPoint");
    this.state.selectedPointIndex = null;
    this.state.selectedPointId = null;
  },

  /* TODO */
  setSelectedPoint(id, step) {
    this.state.isMovingPoint = true;
    this.state.selectedPointId = id;
    this.state.selectedPointStep = step;
    this.state.selectedPointIndex = this.getPath().definition.findIndex(p => p.id === id);
    this.state.svgPoint = document.querySelector('#app svg').createSVGPoint();
    this.state.currentPoint = this.getSegment().dest;
  },

  getPath(pathIndex = this.state.selectedPathIndex) {
    return this.state.allPaths[pathIndex]
  },

  // TODO: use the word "segment" everywhere instead of "point" --> atm it's confusing
  getSegment(
    pathIndex = this.state.selectedPathIndex,
    pointIndex = this.state.selectedPointIndex,
  ) {
    return this.state.allPaths[pathIndex].definition[pointIndex];
  },

  updateType(
    segmentType,
    pathIndex = this.state.selectedPathIndex, 
    pointIndex = this.state.selectedPointIndex,
  ) {
    this.state.allPaths[pathIndex].definition[pointIndex].type = segmentType;
  },

  updateCurve1(
    coordinates,
    pathIndex = this.state.selectedPathIndex, 
    pointIndex = this.state.selectedPointIndex,
  ) {
    this.state.allPaths[pathIndex].definition[pointIndex].curve1 = coordinates;
  },

  updateCurve2(
    coordinates,
    pathIndex = this.state.selectedPathIndex, 
    pointIndex = this.state.selectedPointIndex,
  ) {
    this.state.allPaths[pathIndex].definition[pointIndex].curve2 = coordinates;
  },

  updateDest(
    coordinates,
    pathIndex = this.state.selectedPathIndex, 
    pointIndex = this.state.selectedPointIndex,
  ) {
    this.state.allPaths[pathIndex].definition[pointIndex].dest = coordinates;
  },

  addCircle(center, radius) {
    const d = createCircle(center, radius);
    
    this.createPath();
    this.getPath().definition = d;
    this.getPath().isClosed = true;
    this.historySnapshot();
  },

  addStar(center, outerRadius, innerRadius, arms) {
    const d = createStar(center, outerRadius, innerRadius, arms);
    
    this.createPath();
    this.getPath().definition = d;
    this.getPath().isClosed = true;
    this.historySnapshot();
  },

  updateBBox() {
    if (this.debug) console.log('updateBBox');
    const { selectedPathIndex } = this.state;
    if (window.SELECTED_PATH && (selectedPathIndex !== undefined) ) {
      const bbox = window.SELECTED_PATH.getBBox();
      this.getPath().bbox = bbox;
      this.updatePathCenter(bbox);
    }
  },

  updatePathCenter(bbox) {
    let center = {
      x: bbox.x + bbox.width/2,
      y: bbox.y + bbox.height/2
    }
    this.getPath().center = center;
  },

  updateRotation(val) {
    this.getPath().rotation = val;
    this.updateRotationCenter();
    this.state.transformMatrix = window.SELECTED_PATH.getScreenCTM().inverse();
  },

  updateRotationCenter() {
    /* rotation Center is different from the (path) center. It is defined by the parent Elements BBox because otherwise the existing (rotation) transforms would be ignored */
    let center = this.getPath().center;
    this.getPath().rotationCenter = center;
  },

  bakeRotation() {
    this.getPath().bakeRotation();
    this.state.transformMatrix = window.SELECTED_PATH.getScreenCTM().inverse();

    this.updateBBox();
    this.historySnapshot();
  },

  updateScale(scaleX, scaleY, scalingCenter) {
    scalingCenter = scalingCenter || this.getPath().center;
    this.getPath().scalePath(scaleX, scaleY, scalingCenter);
    
    // don't know what the following line did but i'll save it for now...
    // this.state.transformMatrix = window.SELECTED_PATH.getScreenCTM().inverse();
  },

  resetScale() {
    this.getPath().scale.x = 1;
    this.getPath().scale.y = 1;
  },

  historySnapshot() {
    if (this.debug) console.log("historySnapshot");

    /* first reset the history position and clear all history arrays smaller then the current historyPos */
    if (this.state.historyPos > -1) {
      this.state.history.splice(0, this.state.historyPos + 1);
      console.log('snapshot clear', this.state.history)
      this.state.historyPos = -1;
    }

    if (this.state.history.length > (HISTORY_MAX - 1)) {
      this.state.history.splice(-1, 1);
    }

    const copiedPaths = cloneDeep(this.state.allPaths);
    this.state.history.unshift(copiedPaths);
  },

  setHistoryPos(val) {
    if (this.debug) console.log("setHistoryPos", val);

    this.state.historyPos += val;
  },

  historyGoTo( count = 0 ) {
    if (this.debug) console.log("historyGoTo", count);
    if (count >= (HISTORY_MAX - 1)) return;
    if (count >= (this.state.history.length -1)) return;
    Vue.set(this.state, 'allPaths', cloneDeep(this.state.history[count + 1]) );

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
    this.getPath().strokeLinecap = str;
  },

  setStrokeLinejoin(str) {
    this.getPath().strokeLinejoin = str;
  },

  setStrokeWidth(n) {
    this.getPath().strokeWidth = n;
  },

  joinPoints(pathIndex) {
    this.getPath(pathIndex).isClosed = true;
  },

  copyPath() {
    const copiedPath = clone(this.getPath());
    copiedPath.newID();
    return copiedPath;
  },

  pastePath(copiedPath) {
    this.state.allPaths.push(copiedPath);

    this.selectPath(copiedPath.id, this.state.allPaths.length - 1);
    this.unselectPoint();
  },

  copyPastePath() {
    const copiedPath = this.copyPath();
    this.pastePath(copiedPath);
  },

  splitSegment(distance) {
    if (this.debug) console.log('splitSegment', distance);
    const {selectedPointIndex} = this.state;
    const id = this.getPath().splitSegment(selectedPointIndex, distance);

    this.state.selectedPointId = id;
    this.state.selectedPointIndex = selectedPointIndex + 1;

    this.state.currentPoint = this.getPath().definition[selectedPointIndex + 1].dest;
  },

  createSVG() {
    /* imported function: */
    store.state.svgCode = createSVG();
  },

  exportSVG() {
    /* this actually doesn't store anything inside the state */
    exportSVG();
  }
};

export default store;
