import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(len, 0);

  const crcPayload = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcPayload);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generatePng(width, height, isMaskable = false) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw pixel data: each row has 1 filter byte (0) + width * 4 bytes (RGBA)
  const rowStride = 1 + width * 4;
  const rawData = Buffer.alloc(rowStride * height);

  const cx = width / 2;
  const cy = height / 2;
  const rMane = (width / 2) * (isMaskable ? 0.65 : 0.78);
  const rFace = rMane * 0.7;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowStride;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default background: warm gradient
      const gradT = (x + y) / (width + height);
      let r = Math.round(255 * (1 - gradT * 0.1));
      let g = Math.round(159 - gradT * 50);
      let b = Math.round(28 + gradT * 60);
      let a = 255;

      // Draw Mane circle
      if (dist <= rMane) {
        // Orange mane
        r = 255;
        g = 132;
        b = 0;
      }

      // Draw Face circle
      if (dist <= rFace) {
        // Golden yellow face
        r = 255;
        g = 209;
        b = 102;

        // Eyes
        const eyeDx1 = x - (cx - rFace * 0.35);
        const eyeDx2 = x - (cx + rFace * 0.35);
        const eyeDy = y - (cy - rFace * 0.15);
        const distEye1 = Math.sqrt(eyeDx1 * eyeDx1 + eyeDy * eyeDy);
        const distEye2 = Math.sqrt(eyeDx2 * eyeDx2 + eyeDy * eyeDy);

        if (distEye1 <= rFace * 0.12 || distEye2 <= rFace * 0.12) {
          r = 43; g = 45; b = 66; // Dark pupil
          if (distEye1 <= rFace * 0.04 || distEye2 <= rFace * 0.04) {
            r = 255; g = 255; b = 255; // Eye sparkle
          }
        }

        // Nose
        const noseDx = x - cx;
        const noseDy = y - (cy + rFace * 0.15);
        const distNose = Math.sqrt(noseDx * noseDx + noseDy * noseDy);
        if (distNose <= rFace * 0.1) {
          r = 132; g = 59; b = 98; // Cute nose
        }

        // Cheeks
        const chDx1 = x - (cx - rFace * 0.5);
        const chDx2 = x - (cx + rFace * 0.5);
        const chDy = y - (cy + rFace * 0.2);
        if (Math.sqrt(chDx1 * chDx1 + chDy * chDy) <= rFace * 0.14 ||
            Math.sqrt(chDx2 * chDx2 + chDy * chDy) <= rFace * 0.14) {
          r = 255; g = 107; b = 107; // Rosy cheeks
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), generatePng(192, 192, false));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), generatePng(512, 512, false));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), generatePng(512, 512, true));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), generatePng(180, 180, false));

console.log('Generated PWA PNG icons successfully in public/');
