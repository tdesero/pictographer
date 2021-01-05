import { id } from '../util/id';

class Segment {
  constructor(options) {
      this.type = options.type;
      this.id = id();
      this.curve1 = options.curve1 || {};
      this.curve2 = options.curve2 || {};
      this.dest = options.dest; // object with x & y
  }
}

export class Path {
  constructor() {
    this.id= id();
    this.definition= [];
    this.isClosed= false;
    this.rotation= null;
    this.scale= { x: 1, y: 1 };
    this.bbox= {};
    this.center= {};
    this.rotationCenter= {};
    this.translate= { x: null, y: null };
    this.strokeLinecap= 'butt';
    this.strokeLinejoin= 'miter';
    this.strokeWidth= 2;
    this.hasFill= false;
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
}
