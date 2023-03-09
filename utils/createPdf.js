const fs = require('fs');
const PDFDocument = require('pdfkit');
const Sertificate = require('../models/sertificate.model');
const path = require('path');
const open = require('open')

exports.createPDF = async (res) => {
   try {
      const doc = new PDFDocument();
      const sertificates = await Sertificate.find();
      const images = [];

      for (let i = 0; i < sertificates.length; i++) {
         const sertificate = sertificates[i].file.split('/')[2]
         const image = path.join(__dirname, '..', `public/create/${sertificate}`)
         images.push(image);
      }

      images.forEach(async (image) => {
         const img = doc.openImage(image);

         doc.addPage({
            layout: 'landscape',
            size: [595.28, 841.89], // A4
            margins: {
               top: 20,
               bottom: 20,
               left: 20,
               right: 20
            }
         });

         const imgWidth = doc.page.width - (doc.page.margins.left + doc.page.margins.right);
         const imgHeight = (img.height * imgWidth) / img.width;

         doc.image(img, {
            width: imgWidth,
            height: imgHeight
         });
      });

      const fileName = new Date().getTime();

      const outputPath = path.join(__dirname, '..', 'public', 'export', `${fileName}.pdf`)
      const file = fs.createWriteStream(outputPath)
      doc.pipe(file);

      doc.end()

      await new Promise((resolve) => file.on('finish', resolve));

      await open(outputPath);

      res.redirect('/islom')
   } catch (err) {
      console.log(err);
   }
}