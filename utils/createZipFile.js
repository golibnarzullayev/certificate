const archiver = require('archiver');
const path = require('path')
const fs = require('fs')

async function createZipFile(zipFileName) {
   const publicPath = path.join(__dirname, '..', 'public', 'create')
   const archive = archiver('zip', { zlib: { level: 9 }});
   const zipFilePath = path.join(__dirname, '..', 'public', `export/${zipFileName}`);
   archive.directory(publicPath, false);
 
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