import { id } from '../util/id';
import { Segment } from './Segment';
import { calcScale } from './../util/calcScale';
import { rotatePoint } from './../util/rotatePoint';

export class Path {
  constructor(definition) {
    this.id = id();
    this.definition = definition || [];
    this.isClosed = false;
    this.rotation = null;
    this.scale = { x: 1, y: 1 };
    this.bbox = {};
    this.center = {};
    this.rotationCenter = {};
    this.translate = { x: null, y: null };
    this.strokeLinecap = 'butt';
    this.strokeLinejoin = 'miter';
    this.strokeWidth = 2;
    this.hasFill = false;
  }

  newID() {
    this.id = id();
  }

  getDOMRef() {
    const id = this.id;
    return document.querySelector('#' + id);
  }

  addSegment(segmentOptions) {
    const segment = new Segment(segmentOptions)
    this.definition.push(segment);
    return segment.id;
  }

  addSegmentAtStart(segmentOptions) {
    const segment = new Segment(segmentOptions)
    this.definition.unshift(segment);
    return segment.id;
  }

  addSegmentAtPos(position, segmentOptions) {
    const segment = new Segment(segmentOptions)
    this.definition.splice(position, 0, segment);
    return segment.id;
  }

  scalePath(scaleX, scaleY, center) {
    const oldScale = this.scale;
    this.definition.forEach(s => {
      if (s.type === "C") {
        s.curve1.x = calcScale(s.curve1.x, center.x, scaleX/oldScale.x);
        s.curve1.y = calcScale(s.curve1.y, center.y, scaleY/oldScale.y);
        s.curve2.x = calcScale(s.curve2.x, center.x, scaleX/oldScale.x);
        s.curve2.y = calcScale(s.curve2.y, center.y, scaleY/oldScale.y);
      }
      s.dest.x = calcScale(s.dest.x, center.x, scaleX/oldScale.x);
      s.dest.y = calcScale(s.dest.y, center.y, scaleY/oldScale.y);
    })
    this.scale.x = scaleX;
    this.scale.y = scaleY;
  }

  splitSegment(segmentIndex, distance) {
    const selectedPointType = this.definition[segmentIndex].type;
    let id;

    if (selectedPointType === 'C') {
      id = this.splitCurve(segmentIndex, distance);
    } else if (selectedPointType === 'L') {
      id = this.splitLine(segmentIndex, distance);
    }

    return id;
  }

  splitLine(segmentIndex, distance) {
    const dist = distance || 0.5;
    const seg = this.definition[segmentIndex];

    //the original 2 points defining the bezier curve
    const a = this.definition[segmentIndex-1].dest;
    const b = seg.dest;

    const newSeg = {
      type: 'L',
      curve1: {},
      curve2: {},
      dest: {x: b.x,y: b.y}
    }
    const id = this.addSegmentAtPos(segmentIndex + 1, newSeg);

    b.x = a.x + (b.x - a.x) * dist;
    b.y = a.y + (b.y - a.y) * dist;

    return id;
  }

  splitCurve(segmentIndex, distance) {
    const dist = distance || 0.5;
    const seg = this.definition[segmentIndex];

    //the original 4 points defining the bezier curve
    const a = this.definition[segmentIndex-1].dest;
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

    const newSeg = {
      type: 'C',
      curve1: {x: j.x, y: j.y},
      curve2: {x: g.x, y: g.y},
      dest: {x: d.x,y: d.y}
    }
    const id = this.addSegmentAtPos(segmentIndex + 1, newSeg);

    // mutating the original segment object should be done after
    seg.curve1.x = e.x;
    seg.curve1.y = e.y;
    seg.curve2.x = h.x;
    seg.curve2.y = h.y;
    seg.dest.x = k.x;
    seg.dest.y = k.y;

    return id;
  }

  bakeRotation() {
    const { rotationCenter, rotation } = this;
    this.definition.forEach(s => {
      if (s.type === "C") {
        s.curve1 = rotatePoint( s.curve1, rotationCenter.x,  rotationCenter.y, rotation);  
        s.curve2 = rotatePoint( s.curve2, rotationCenter.x,  rotationCenter.y, rotation);
      }
      s.dest = rotatePoint( s.dest, rotationCenter.x,  rotationCenter.y, rotation);
    })
    this.rotation = 0;
  }

  updateBBox() {
    const bbox = this.getDOMRef().getBBox();
    this.bbox = bbox;
    this.updateCenter();
  }

  updateCenter() {
    const bbox = this.bbox;
    let center = {
      x: bbox.x + bbox.width/2,
      y: bbox.y + bbox.height/2
    }
    this.center = center;
  }
}
