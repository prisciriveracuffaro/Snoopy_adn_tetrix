const fs = require('fs');
const { PNG } = require('pngjs');

const file = 'src/assets/marco.png';
const data = fs.readFileSync(file);
const png = PNG.sync.read(data);

const width = png.width;
const height = png.height;

// Look at the center of the image to find the board background color.
const centerX = Math.floor(width / 2);
const centerY = Math.floor(height * 0.4); // 40% down

const idx = (width * centerY + centerX) << 2;
const br = png.data[idx];
const bg = png.data[idx + 1];
const bb = png.data[idx + 2];
console.log(`Center pixel color at (${centerX}, ${centerY}): RGB(${br}, ${bg}, ${bb})`);

// Now let's trace horizontally from the center to the left and right
// to find where this background color ends (which should be the board's blue borders).
let leftX = centerX;
while (leftX > 0) {
  const i = (width * centerY + leftX) << 2;
  const r = png.data[i];
  const g = png.data[i + 1];
  const b = png.data[i + 2];
  // If we hit a pixel that is significantly different from the background, stop.
  // The board background is very dark. If we hit the bright cyan border, it will have high G and B.
  if (Math.abs(r - br) > 30 || Math.abs(g - bg) > 30 || Math.abs(b - bb) > 30) {
    break;
  }
  leftX--;
}

let rightX = centerX;
while (rightX < width - 1) {
  const i = (width * centerY + rightX) << 2;
  const r = png.data[i];
  const g = png.data[i + 1];
  const b = png.data[i + 2];
  if (Math.abs(r - br) > 30 || Math.abs(g - bg) > 30 || Math.abs(b - bb) > 30) {
    break;
  }
  rightX++;
}

console.log(`Board horizontal bounds: Left=${leftX}, Right=${rightX}`);
console.log(`Board width: ${rightX - leftX} pixels`);
console.log(`Relative percentages (width): Left=${(leftX/width*100).toFixed(2)}%, Right=${(rightX/width*100).toFixed(2)}%, Width=${((rightX - leftX)/width*100).toFixed(2)}%`);

// Trace vertically from the center to the top and bottom
// to find where the board background color ends.
let topY = centerY;
while (topY > 0) {
  const i = (width * topY + centerX) << 2;
  const r = png.data[i];
  const g = png.data[i + 1];
  const b = png.data[i + 2];
  if (Math.abs(r - br) > 30 || Math.abs(g - bg) > 30 || Math.abs(b - bb) > 30) {
    break;
  }
  topY--;
}

let bottomY = centerY;
while (bottomY < height - 1) {
  const i = (width * bottomY + centerX) << 2;
  const r = png.data[i];
  const g = png.data[i + 1];
  const b = png.data[i + 2];
  if (Math.abs(r - br) > 30 || Math.abs(g - bg) > 30 || Math.abs(b - bb) > 30) {
    break;
  }
  bottomY++;
}

console.log(`Board vertical bounds: Top=${topY}, Bottom=${bottomY}`);
console.log(`Board height: ${bottomY - topY} pixels`);
console.log(`Relative percentages (height): Top=${(topY/height*100).toFixed(2)}%, Bottom=${(bottomY/height*100).toFixed(2)}%, Height=${((bottomY - topY)/height*100).toFixed(2)}%`);
