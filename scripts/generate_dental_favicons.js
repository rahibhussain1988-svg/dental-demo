const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// 1. Generate SVG Favicon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="clinicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0D9488"/>
      <stop offset="100%" stop-color="#042F2E"/>
    </linearGradient>
    <linearGradient id="toothGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E0F2FE"/>
    </linearGradient>
    <filter id="toothDrop" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-color="#021C1B" flood-opacity="0.38"/>
    </filter>
  </defs>

  <!-- Squircle Base -->
  <rect width="64" height="64" rx="16" fill="url(#clinicGrad)"/>
  <rect x="1" y="1" width="62" height="62" rx="15" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>

  <!-- Dental Tooth Anatomy -->
  <path d="M22 13 C26.5 13 29.5 14.8 32 16 C34.5 14.8 37.5 13 42 13 C48.5 13 52 17.5 52 24.5 C52 30.5 48.5 37 45.5 44 C44 47.5 42 51 39.5 51 C37.5 51 36.5 48.5 35.8 44.5 C34.8 38.5 33.5 35 32 35 C30.5 35 29.2 38.5 28.2 44.5 C27.5 48.5 26.5 51 24.5 51 C22 51 20 47.5 18.5 44 C15.5 37 12 30.5 12 24.5 C12 17.5 15.5 13 22 13 Z"
        fill="url(#toothGrad)"
        filter="url(#toothDrop)"/>

  <!-- Enamel Gloss -->
  <path d="M19 16 C16 19 15 23 15 27 C15 30 16 33 17 35 C17.5 32 18 25 21 20 C23 17 25 15.5 27 15 C24 15 21 15.2 19 16 Z"
        fill="#FFFFFF"
        opacity="0.65"/>

  <!-- Tooth Central Fissure Accent -->
  <path d="M32 17.5 C32 21 32 24 32 26.5" stroke="#BAE6FD" stroke-width="2" stroke-linecap="round"/>

  <!-- Dental Star / Gleam (Clean Tooth Accent) -->
  <path d="M48 8 L49.6 13.5 L55 15.2 L49.6 16.9 L48 22.4 L46.4 16.9 L41 15.2 L46.4 13.5 Z"
        fill="#5EEAD4"/>
  <circle cx="48" cy="15.2" r="1.6" fill="#FFFFFF"/>
</svg>`;

// 2. Pure JS CRC32
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

// 3. Make PNG Chunk
function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = crc32(Buffer.concat([typeBuf, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// 4. Generate PNG
function generateDentalPng(size = 32) {
  const width = size;
  const height = size;
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;

  // Render a clean dental tooth on rounded squircle background
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const nx = (x + 0.5) / width;
      const ny = (y + 0.5) / height;

      // Squircle distance check
      const cx = nx - 0.5;
      const cy = ny - 0.5;
      const r = Math.pow(Math.abs(cx * 2), 3.2) + Math.pow(Math.abs(cy * 2), 3.2);

      if (r > 1.0) {
        // Transparent outside squircle
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        continue;
      }

      // Inside squircle base color (Teal gradient: #0D9488 to #042F2E)
      let bgR = Math.round(13 + (4 - 13) * ny);
      let bgG = Math.round(148 + (47 - 148) * ny);
      let bgB = Math.round(136 + (46 - 136) * ny);

      // Simple antialiased edge for squircle
      let alpha = 255;
      if (r > 0.88) {
        alpha = Math.round(255 * (1 - (r - 0.88) / 0.12));
      }

      // Tooth geometry check (approximate sampled dental shape)
      // Tooth center is around (0.5, 0.52), width ~0.62, height ~0.65
      const tx = (nx - 0.5) / 0.31; // -1 to 1
      const ty = (ny - 0.52) / 0.33; // -1 to 1

      let inTooth = false;
      let inGleam = false;

      // Sparkle in top right
      const gx = nx - 0.75;
      const gy = ny - 0.24;
      const starDist = Math.abs(gx) * Math.abs(gy);
      const starRad = Math.hypot(gx, gy);
      if (starRad < 0.13 && (Math.abs(gx) < 0.02 || Math.abs(gy) < 0.02 || starDist < 0.0008)) {
        inGleam = true;
      }

      if (ty >= -0.9 && ty <= 0.95 && Math.abs(tx) <= 0.92) {
        // Crown curve at top: twin lobes
        const crownTop = -0.75 + 0.15 * Math.cos(tx * Math.PI);
        if (ty >= crownTop) {
          // Bottom roots curve: two roots at tx ~ -0.45 and tx ~ +0.45 with bifurcation at center
          let rootBottom = 0.85;
          if (Math.abs(tx) < 0.22) {
            // Bifurcation notch
            rootBottom = 0.35 + 1.2 * Math.abs(tx);
          } else {
            rootBottom = 0.88 - 0.3 * Math.pow(Math.abs(tx) - 0.5, 2);
          }

          // Side taper
          const sideLimit = 0.85 - 0.35 * Math.max(0, ty);
          if (ty <= rootBottom && Math.abs(tx) <= sideLimit) {
            inTooth = true;
          }
        }
      }

      if (inGleam) {
        rawData[offset++] = 94;
        rawData[offset++] = 234;
        rawData[offset++] = 212;
        rawData[offset++] = 255;
      } else if (inTooth) {
        // Crisp white / soft cyan shading
        const shade = Math.round(255 - 25 * Math.max(0, ty));
        rawData[offset++] = shade;
        rawData[offset++] = Math.min(255, shade + 2);
        rawData[offset++] = 255;
        rawData[offset++] = 255;
      } else {
        rawData[offset++] = bgR;
        rawData[offset++] = bgG;
        rawData[offset++] = bgB;
        rawData[offset++] = alpha;
      }
    }
  }

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // Compression
  ihdrData.writeUInt8(0, 11); // Filter
  ihdrData.writeUInt8(0, 12); // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// 5. Generate ICO wrapping 32x32 PNG
function generateDentalIco(png32) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(1, 4); // 1 image

  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(32, 0); // width
  dirEntry.writeUInt8(32, 1); // height
  dirEntry.writeUInt8(0, 2);  // color count
  dirEntry.writeUInt8(0, 3);  // reserved
  dirEntry.writeUInt16LE(1, 4); // color planes
  dirEntry.writeUInt16LE(32, 6); // bpp
  dirEntry.writeUInt32LE(png32.length, 8); // image size
  dirEntry.writeUInt32LE(22, 12); // offset (6 + 16 = 22)

  return Buffer.concat([header, dirEntry, png32]);
}

// Execute Generation
const teleClinicDir = path.join(__dirname, '..');
const mirrorDir = 'G:\\My Drive\\New POS Restaurant\\dental-demo';

const png32 = generateDentalPng(32);
const png64 = generateDentalPng(64);
const icoBuf = generateDentalIco(png32);

// Save to Tele-Clinic
fs.writeFileSync(path.join(teleClinicDir, 'favicon.svg'), svgContent, 'utf8');
fs.writeFileSync(path.join(teleClinicDir, 'favicon.png'), png32);
fs.writeFileSync(path.join(teleClinicDir, 'favicon-64x64.png'), png64);
fs.writeFileSync(path.join(teleClinicDir, 'favicon.ico'), icoBuf);
console.log('✅ Generated favicon.svg, favicon.png, favicon.ico in Tele-Clinic');

// Save to New POS Restaurant / dental-demo
if (fs.existsSync(mirrorDir)) {
  fs.writeFileSync(path.join(mirrorDir, 'favicon.svg'), svgContent, 'utf8');
  fs.writeFileSync(path.join(mirrorDir, 'favicon.png'), png32);
  fs.writeFileSync(path.join(mirrorDir, 'favicon-64x64.png'), png64);
  fs.writeFileSync(path.join(mirrorDir, 'favicon.ico'), icoBuf);
  console.log('✅ Mirrored favicons to New POS Restaurant/dental-demo');
}

// Also update index.html to include favicon links
const headLinks = `  <!-- Medical Dental Clinic Favicon Suite -->
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="favicon.png">
  <link rel="icon" type="image/png" sizes="64x64" href="favicon-64x64.png">
  <link rel="alternate icon" type="image/x-icon" href="favicon.ico">
  <link rel="apple-touch-icon" href="favicon.png">`;

function updateHtmlFavicon(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('<!-- Medical Dental Clinic Favicon Suite -->')) {
    console.log(`ℹ️ ${filePath} already has favicon suite`);
    return;
  }
  html = html.replace('  <link rel="stylesheet" href="css/styles.css">', `${headLinks}\n  <link rel="stylesheet" href="css/styles.css">`);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✅ Updated ${filePath} with favicon links`);
}

updateHtmlFavicon(path.join(teleClinicDir, 'index.html'));
if (fs.existsSync(mirrorDir)) {
  updateHtmlFavicon(path.join(mirrorDir, 'index.html'));
}
