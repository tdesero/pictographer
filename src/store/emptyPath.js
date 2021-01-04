export function emptyPath() {
  return {
    id: new Date().getTime(),
    definition: [],
    isClosed: false,
    rotation: null,
    scale: { x: 1, y: 1 },
    bbox: {},
    center: {},
    rotationCenter: {},
    translate: { x: null, y: null },
    strokeLinecap: 'butt',
    strokeLinejoin: 'miter',
    strokeWidth: 2,
    hasFill: false,
  };
}
