import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' }
];

async function generateIcons() {
  const inputPath = join(__dirname, '..', 'public', 'icons', 'workoutimer.png');
  
  for (const { size, name } of sizes) {
    const outputPath = join(__dirname, '..', 'public', 'icons', name);
    
    try {
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toFile(outputPath);
      
      console.log(`Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`Error generating ${name}:`, error);
    }
  }
}

generateIcons().then(() => {
  console.log('All icons generated successfully!');
}).catch(error => {
  console.error('Error:', error);
});
