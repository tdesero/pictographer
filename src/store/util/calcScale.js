export function calcScale(val, center, scale) {
  let p = val - center; // get a vector to v relative to the centerpoint
  p = p * scale; // scale the cp-relative-vector
  p = p + center; // translate the scaled vector back
  return p;
} 