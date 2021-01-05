import { createSVG } from './createSVG';

export function exportSVG() {
  const svgCode = createSVG();
  const blob = new Blob([svgCode], { type: "image/svg+xml" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = 'export.svg';
  a.click();
}
