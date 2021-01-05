export function rotatePoint(p, cx, cy, angle) {
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