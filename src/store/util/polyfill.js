/* polyfill */
export function polyfill() {
  SVGElement.prototype.getTransformToElement = SVGElement.prototype.getTransformToElement || function (toElement) {

    return toElement.getScreenCTM().inverse().multiply(this.getScreenCTM());

  };
}
