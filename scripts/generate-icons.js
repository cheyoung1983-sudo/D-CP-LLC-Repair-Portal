import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
  </defs>

  <!-- Background rounded card -->
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#bgGrad)" />
  <rect x="${size * 0.04}" y="${size * 0.04}" width="${size * 0.92}" height="${size * 0.92}" rx="${size * 0.18}" fill="none" stroke="#1e293b" stroke-width="${size * 0.02}" />

  <!-- Circuit traces -->
  <path d="M ${size * 0.2} ${size * 0.3} L ${size * 0.35} ${size * 0.3} L ${size * 0.4} ${size * 0.4}" fill="none" stroke="#334155" stroke-width="${size * 0.02}" stroke-linecap="round" />
  <circle cx="${size * 0.2}" cy="${size * 0.3}" r="${size * 0.03}" fill="#38bdf8" />
  
  <path d="M ${size * 0.8} ${size * 0.7} L ${size * 0.65} ${size * 0.7} L ${size * 0.6} ${size * 0.6}" fill="none" stroke="#334155" stroke-width="${size * 0.02}" stroke-linecap="round" />
  <circle cx="${size * 0.8}" cy="${size * 0.7}" r="${size * 0.03}" fill="#38bdf8" />

  <!-- Central Chip Shield -->
  <rect x="${size * 0.28}" y="${size * 0.28}" width="${size * 0.44}" height="${size * 0.44}" rx="${size * 0.08}" fill="url(#accentGrad)" />
  
  <!-- Microchip pins -->
  <!-- Top pins -->
  <rect x="${size * 0.36}" y="${size * 0.22}" width="${size * 0.04}" height="${size * 0.06}" rx="${size * 0.01}" fill="#94a3b8" />
  <rect x="${size * 0.48}" y="${size * 0.22}" width="${size * 0.04}" height="${size * 0.06}" rx="${size * 0.01}" fill="#94a3b8" />
  <rect x="${size * 0.60}" y="${size * 0.22}" width="${size * 0.04}" height="${size * 0.06}" rx="${size * 0.01}" fill="#94a3b8" />
  
  <!-- Bottom pins -->
  <rect x="${size * 0.36}" y="${size * 0.72}" width="${size * 0.04}" height="${size * 0.06}" rx="${size * 0.01}" fill="#94a3b8" />
  <rect x="${size * 0.48}" y="${size * 0.72}" width="${size * 0.04}" height="${size * 0.06}" rx="${size * 0.01}" fill="#94a3b8" />
  <rect x="${size * 0.60}" y="${size * 0.72}" width="${size * 0.04}" height="${size * 0.06}" rx="${size * 0.01}" fill="#94a3b8" />

  <!-- Left pins -->
  <rect x="${size * 0.22}" y="${size * 0.36}" width="${size * 0.06}" height="${size * 0.04}" rx="${size * 0.01}" fill="#94a3b8" />
  <rect x="${size * 0.22}" y="${size * 0.48}" width="${size * 0.06}" height="${size * 0.04}" rx="${size * 0.01}" fill="#94a3b8" />
  <rect x="${size * 0.22}" y="${size * 0.60}" width="${size * 0.06}" height="${size * 0.04}" rx="${size * 0.01}" fill="#94a3b8" />

  <!-- Right pins -->
  <rect x="${size * 0.72}" y="${size * 0.36}" width="${size * 0.06}" height="${size * 0.04}" rx="${size * 0.01}" fill="#94a3b8" />
  <rect x="${size * 0.72}" y="${size * 0.48}" width="${size * 0.06}" height="${size * 0.04}" rx="${size * 0.01}" fill="#94a3b8" />
  <rect x="${size * 0.72}" y="${size * 0.60}" width="${size * 0.06}" height="${size * 0.04}" rx="${size * 0.01}" fill="#94a3b8" />

  <!-- Lightning / Wrench Core Emblem in Chip -->
  <path d="M ${size * 0.52} ${size * 0.34} L ${size * 0.40} ${size * 0.50} L ${size * 0.48} ${size * 0.50} L ${size * 0.46} ${size * 0.66} L ${size * 0.60} ${size * 0.48} L ${size * 0.52} ${size * 0.48} Z" fill="#ffffff" />
</svg>
`;

async function generate() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 192x192
  await sharp(Buffer.from(svgIcon(192)))
    .png()
    .toFile(path.join(publicDir, 'pwa-192.png'));
  console.log('Created pwa-192.png');

  // 512x512
  await sharp(Buffer.from(svgIcon(512)))
    .png()
    .toFile(path.join(publicDir, 'pwa-512.png'));
  console.log('Created pwa-512.png');

  // apple-touch-icon 180x180
  await sharp(Buffer.from(svgIcon(180)))
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // favicon 32x32
  await sharp(Buffer.from(svgIcon(32)))
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Created favicon.png');

  // SVG
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon(512));
  console.log('Created icon.svg');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
