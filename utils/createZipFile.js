const archiver = require('archiver');
const path = require('path')
const fs = require('fs');
const sertificateModel = require('../models/sertificate.model');

async function createZipFile(zipFileName) {
   const certificates = await sertificateModel.find();
   const destinationFolderPath = path.join(__dirname, '..', 'public/create');

   for (const certificate of certificates) {
      const certificateBaseName = certificate.file.split('/')[2]
      const sourceFilePath = path.join(__dirname, '..', 'public', `certificate/${certificateBaseName}`);

      if (fs.existsSync(destinationFolderPath)) {
         fs.mkdirSync(destinationFolderPath, { recursive: true });

         fs.copyFileSync(sourceFilePath, path.join(destinationFolderPath, certificateBaseName));
      }
   }
   const archive = archiver('zip', { zlib: { level: 9 }});
   const zipFilePath = path.join(__dirname, '..', 'public', `export/${zipFileName}`);
   archive.directory(destinationFolderPath, false);
 
   const output = fs.createWriteStream(zipFilePath);
   archive.pipe(output);
 
   return new Promise((resolve, reject) => {
      output.on('close', function() {
         resolve(zipFilePath);
      });
   
      archive.on('error', function(err) {
         reject(err);
      });
   
      archive.finalize();
   });
}

module.exports = createZipFile;