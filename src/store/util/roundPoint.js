export function roundPoint(point) {
  let newPoint = {};
  newPoint.x = Math.round(point.x);
  newPoint.y = Math.round(point.y);

  return newPoint;
}
