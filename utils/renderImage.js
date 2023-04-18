const Sertificate = require('../models/sertificate.model')
const Jimp = require('jimp')
const path = require('path');
const fs = require('fs');
const qr = require('qrcode');

async function renderImage(pathName, textData, type) {
   try {
      const imgRaw = path.join(__dirname, '..', 'public', 'active', pathName, 'active.png');
      const font_42_path = path.join(__dirname, '..', 'public', 'fonts', 'font_42.ttf.fnt');
      const font_100_path = path.join(__dirname, '..', 'public', 'fonts', 'font_100.ttf.fnt');

      const montserrat_40_path = path.join(__dirname, '..', 'public', 'fonts', 'montserrat_40.ttf.fnt');
      const montserrat_47_path = path.join(__dirname, '..', 'public', 'fonts', 'montserrat_47.ttf.fnt');
      const montserrat_100_path = path.join(__dirname, '..', 'public', 'fonts', 'montserrat_100.ttf.fnt');

      const montserrat_40 = await Jimp.loadFont(montserrat_40_path)
      const montserrat_47 = await Jimp.loadFont(montserrat_47_path)
      const montserrat_100 = await Jimp.loadFont(montserrat_100_path)

      const font_42 = await Jimp.loadFont(font_42_path)
      const font_100 = await Jimp.loadFont(font_100_path)

      const url = `https://itpark-qarshi.uz/certificate/${textData.id}.png`;

      const options = {
         type: 'png'
      };
      const outputPath = path.join(__dirname, '..', 'public', 'qr', `${textData.id}.png`)
      await qr.toFile(outputPath, url, options);
      const image = await Jimp.read(imgRaw);
      const qrCodeUrl = path.join(__dirname, '..', 'public', 'qr', `${textData.id}.png`);
      const qrImage = await Jimp.read(qrCodeUrl);
      qrImage.resize(314, 314);

      image.composite(qrImage, type == 'davlat' ? 2100 : 1710, 100)

      if (type === 'davlat') {
         image.print(montserrat_100, textData.fullNameTextData.placementX, textData.fullNameTextData.placementY, {
            text: textData.fullNameTextData.text,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
         }, 1640)
      } else {
         image.print(
            font_100,
            textData.fullNameTextData.placementX,
            textData.fullNameTextData.placementY,
            textData.fullNameTextData.text
         )
      }

      image.print(
         type === 'davlat' ? montserrat_40 : font_42,
         textData.idTextData.placementX,
         textData.idTextData.placementY,
         textData.idTextData.text
      )

      image.print(
         type === 'davlat' ? montserrat_47 : font_42,
         textData.dateTextData.placementX,
         textData.dateTextData.placementY,
         textData.dateTextData.text
      )

      // /export/${pathName}/${user.fileName}_${user.id}.png
      await image.quality(100).writeAsync(path.join(__dirname, '..', 'public', 'create', `${textData.id}.png`));

      await Sertificate.create({
         fullName: textData.fullNameTextData.text,
         file: `/sertificate/${textData.id}.png`,
         sertificateId: textData.id
      })

      await fs.unlinkSync(qrCodeUrl);
      
   } catch (err) {
      console.log(err);
   }
}

module.exports = renderImage;