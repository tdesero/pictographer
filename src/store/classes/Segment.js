import { id } from '../util/id';

export class Segment {
  constructor(options) {
    this.type = options.type;
    this.id = id();
    this.curve1 = options.curve1 || {};
    this.curve2 = options.curve2 || {};
    this.dest = options.dest; // object with x & y
  }
}
