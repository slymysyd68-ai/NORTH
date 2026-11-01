import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

async function createProjectArchive() {
  const zip = new JSZip();

  function addFolderToZip(dirPath, zipFolder) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name.endsWith('.zip')) {
        continue;
      }
      if (entry.isDirectory()) {
        const subFolder = zipFolder.folder(entry.name);
        addFolderToZip(fullPath, subFolder);
      } else {
        const fileContent = fs.readFileSync(fullPath);
        zipFolder.file(entry.name, fileContent);
      }
    }
  }

  addFolderToZip('.', zip);

  console.log('Generating zip buffer...');
  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  const outputPath = path.resolve('north-luxury-watches.zip');
  fs.writeFileSync(outputPath, content);
  console.log(`Zip archive successfully written to: ${outputPath} (${(content.length / 1024 / 1024).toFixed(2)} MB)`);
}

createProjectArchive().catch(console.error);
