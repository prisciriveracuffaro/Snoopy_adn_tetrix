const fs = require('fs');
const { PNG } = require('pngjs');

const file = 'src/assets/marco.png';
const data = fs.readFileSync(file);
const png = PNG.sync.read(data);

const width = png.width;
const height = png.height;

console.log(`Image size: ${width}x${height}`);

// Let's find the main blue border.
// We know it's a vertical rectangular border of light blue color.
// Let's scan row by row to find where cyan/blue borders are.
// We look for pixels where R is low, G is high-ish, B is high (cyan-like).
// E.g., R < 100, G > 150, B > 200 (for cyan #4cc9f0)
// Let's print out the coordinates of all pixels matching this criteria.
const cyanPixels = [];
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (width * y + x) << 2;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    
    // Check if it matches a cyan-ish border
    if (r > 50 && r < 120 && g > 150 && g < 220 && b > 200 && b < 255) {
      cyanPixels.push({ x, y, r, g, b });
    }
  }
}

console.log(`Found ${cyanPixels.length} cyan-ish pixels.`);

if (cyanPixels.length > 0) {
  // Let's find the bounding box of these cyan pixels.
  let minX = width, maxX = 0, minY = height, maxY = 0;
  cyanPixels.forEach(p => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });
  console.log(`Cyan bounding box: Left=${minX}, Right=${maxX}, Top=${minY}, Bottom=${maxY}`);
  console.log(`Relative percentages (width): Left=${(minX/width*100).toFixed(2)}%, Right=${(maxX/width*100).toFixed(2)}%`);
  console.log(`Relative percentages (height): Top=${(minY/height*100).toFixed(2)}%, Bottom=${(maxY/height*100).toFixed(2)}%`);
}

// Now let's find the dark hollow area at the bottom.
// In the screenshot, there is a dark rectangular area at the bottom with a brown wooden frame.
// The frame itself is brown (R > 80, G > 40, B < 40).
// Inside the frame, it is very dark.
// Let's print out some pixels near the bottom (between y = 2300 and 2900) to find the dark box.
// Specifically, let's find where a very dark region starts and ends vertically.
const darkRows = [];
for (let y = Math.floor(height * 0.75); y < height; y++) {
  let darkCount = 0;
  for (let x = Math.floor(width * 0.1); x < Math.floor(width * 0.9); x++) {
    const idx = (width * y + x) << 2;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    // Very dark blue/black (R < 30, G < 30, B < 50)
    if (r < 30 && g < 30 && b < 50) {
      darkCount++;
    }
  }
  const ratio = darkCount / (width * 0.8);
  if (ratio > 0.85) {
    darkRows.push(y);
  }
}

if (darkRows.length > 0) {
  const minY = darkRows[0];
  const maxY = darkRows[darkRows.length - 1];
  console.log(`Dark hollow vertical range: Top=${minY}, Bottom=${maxY}`);
  console.log(`Relative percentages (height): Top=${(minY/height*100).toFixed(2)}%, Bottom=${(maxY/height*100).toFixed(2)}%`);
  
  // Let's find the horizontal range of this dark hollow region at y = (minY + maxY) / 2
  const midY = Math.floor((minY + maxY) / 2);
  let minX = width, maxX = 0;
  for (let x = 0; x < width; x++) {
    const idx = (width * midY + x) << 2;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    if (r < 30 && g < 30 && b < 50) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
  }
  console.log(`Dark hollow horizontal range at y=${midY}: Left=${minX}, Right=${maxX}`);
  console.log(`Relative percentages (width): Left=${(minX/width*100).toFixed(2)}%, Right=${(maxX/width*100).toFixed(2)}%`);
}
