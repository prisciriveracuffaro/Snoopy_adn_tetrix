const fs = require('fs');
const { PNG } = require('pngjs');

const file = 'src/assets/marco.png';
const data = fs.readFileSync(file);
const png = PNG.sync.read(data);

const width = png.width;
const height = png.height;

console.log(`Image size: ${width}x${height}`);

// Let's find the main blue border.
// We look for pixels where R is low, G is high-ish, B is high (cyan-like).
// E.g., R < 120, G > 120, B > 180 (for cyan #4cc9f0, or variations in compressed images)
const cyanPixels = [];
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (width * y + x) << 2;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    
    // Check if it matches a cyan-ish border
    if (r > 40 && r < 130 && g > 130 && g < 230 && b > 190 && b < 255) {
      cyanPixels.push({ x, y, r, g, b });
    }
  }
}

console.log(`Found ${cyanPixels.length} cyan-ish pixels.`);

if (cyanPixels.length > 0) {
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

// Let's find the dark hollow area at the bottom.
const darkRows = [];
for (let y = Math.floor(height * 0.75); y < height; y++) {
  let darkCount = 0;
  for (let x = Math.floor(width * 0.1); x < Math.floor(width * 0.9); x++) {
    const idx = (width * y + x) << 2;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    // Very dark blue/black (R < 35, G < 35, B < 60)
    if (r < 35 && g < 35 && b < 60) {
      darkCount++;
    }
  }
  const ratio = darkCount / (width * 0.8);
  if (ratio > 0.8) {
    darkRows.push(y);
  }
}

if (darkRows.length > 0) {
  const minY = darkRows[0];
  const maxY = darkRows[darkRows.length - 1];
  console.log(`Dark hollow vertical range: Top=${minY}, Bottom=${maxY}`);
  console.log(`Relative percentages (height): Top=${(minY/height*100).toFixed(2)}%, Bottom=${(maxY/height*100).toFixed(2)}%`);
  
  const midY = Math.floor((minY + maxY) / 2);
  let minX = width, maxX = 0;
  for (let x = 0; x < width; x++) {
    const idx = (width * midY + x) << 2;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    if (r < 35 && g < 35 && b < 60) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
  }
  console.log(`Dark hollow horizontal range at y=${midY}: Left=${minX}, Right=${maxX}`);
  console.log(`Relative percentages (width): Left=${(minX/width*100).toFixed(2)}%, Right=${(maxX/width*100).toFixed(2)}%`);
}
