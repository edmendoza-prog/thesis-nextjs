const sharp = require('sharp');
const path = require('path');

async function processImage() {
  const inputPath = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\1a79ca21-c64d-4e3b-9254-b31786c3a199\\teacher_dashboard_hero_1789886063939.jpg';
  const outputPath = path.join(__dirname, '../public/images/dashboard-hero.png');

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels; // 4 (RGBA)

  // Scan every pixel: if it is near white / gray background, fade alpha out
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const diff = maxC - minC; // saturation indicator

    // Background is near-white or light gray shadow (diff is small and minC is high)
    if (diff < 15 && minC > 215) {
      if (minC > 242) {
        data[i + 3] = 0;
      } else {
        // smooth gradient alpha
        const t = (minC - 215) / (242 - 215);
        data[i + 3] = Math.max(0, Math.round((1 - t) * 255));
      }
    } else if (diff < 25 && minC > 230) {
      if (minC > 245) {
        data[i + 3] = 0;
      } else {
        const t = (minC - 230) / (245 - 230);
        data[i + 3] = Math.max(0, Math.round((1 - t) * 255));
      }
    }
  }

  // Trim transparent edges
  await sharp(data, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
  .trim()
  .png()
  .toFile(outputPath);

  console.log('Saved refined transparent PNG to', outputPath);
}

processImage().catch(console.error);
