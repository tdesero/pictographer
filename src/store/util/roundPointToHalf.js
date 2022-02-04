export function roundPointToHalf(point) {
  let newPoint = {};
  newPoint.x = Math.round(point.x * 2) / 2;
  newPoint.y = Math.round(point.y * 2) / 2;

  return newPoint;
}
