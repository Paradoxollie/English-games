const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sourceDir = './images';
const outputDir = './public/images/optimized';

async function optimizeImages() {
    try {
        // Créer le dossier de sortie s'il n'existe pas
        await fs.mkdir(outputDir, { recursive: true });

        // Lire tous les fichiers du dossier source
        const files = await fs.readdir(sourceDir);

        for (const file of files) {
            if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
                const inputPath = path.join(sourceDir, file);
                const fileName = path.parse(file).name;

                console.log(`Optimizing ${file}...`);

                // Créer version 300px
                await sharp(inputPath)
                    .resize(300, null, {
                        withoutEnlargement: true,
                        fit: 'inside'
                    })
                    .webp({ quality: 80 })
                    .toFile(path.join(outputDir, `${fileName}-300.webp`));

                // Créer version 600px
                await sharp(inputPath)
                    .resize(600, null, {
                        withoutEnlargement: true,
                        fit: 'inside'
                    })
                    .webp({ quality: 80 })
                    .toFile(path.join(outputDir, `${fileName}-600.webp`));

                // Créer version originale en WebP
                await sharp(inputPath)
                    .webp({ quality: 80 })
                    .toFile(path.join(outputDir, `${fileName}.webp`));

                console.log(`✓ ${file} optimized`);
            }
        }

        console.log('All images have been optimized!');
    } catch (error) {
        console.error('Error optimizing images:', error);
    }
}

// Ajoutez ces lignes dans package.json
// "scripts": {
//     "optimize-images": "node scripts/optimize-images.js"
// }

optimizeImages(); 