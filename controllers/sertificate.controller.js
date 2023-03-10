const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const readXlsxFile = require('read-excel-file/node');
const Sertificate = require('../models/sertificate.model');
const File = require('../models/file.model');
const Jimp = require('jimp');
const qr = require('qrcode');
const moment = require('moment');
const util = require('util');
const { createPDF } = require('../utils/createPdf');
const publicPath = path.join(__dirname, '..', 'public', 'create');
const zipFileName = 'public_files.zip';
const unlinkFile = util.promisify(fs.unlink);

exports.homePage = async (req, res) => {
   try {
      const isLogged = req.session.isLogged;
      const downloadErr = req.flash('downloadErr')[0]
      const sertificates = await Sertificate.find().lean();
      res.render('home', {
         title: "Bosh sahifa",
         sertificates: sertificates.reverse(),
         error: downloadErr,
         isLogged
      })
   } catch (err) {
      console.log(err);
   }
}

exports.uploadPage = async (req, res) => {
   try {
      const isLogged = req.session.isLogged;
      const uploadErr = req.flash('uploadErr')[0];
      res.render('upload', {
         title: 'Fayl yuklash',
         error: uploadErr,
         isLogged
      })
   } catch (err) {
      console.log(err);
   }
}

exports.upload = async (req, res) => {
   try {
      if (!req.files) {
         req.flash('uploadErr', 'fayl yuklanmagan')
         return res.redirect('/islom/upload')
      }
   
      const excelFile = req.files.file;
   
      if(excelFile.size > 5000000) {
         req.flash('uploadErr', 'Fayl hajmi juda katta')
         return res.redirect('/islom/upload')
      }
   
      excelFile.name = `excel_file_${Date.now()}${path.parse(excelFile.name).ext}`;
      const { course } = req.body;

      if (!course) {
         req.flash('uploadErr', 'Kurs tanlanmadi')
         return res.redirect('/islom/upload')
      }
   
      excelFile.mv(`public/upload/${excelFile.name}`, async (err) => {
         if (err) {
            req.flash('uploadErr', 'Fayl yuklanmadi');
            return res.redirect('/islom/upload')
         }
      })
   
      await File.create({
         fileName: `${course}_${new Date().getTime()}`,
         file: `/upload/${excelFile.name}`
      })

      res.redirect('/islom/generate')
   } catch (err) {
      console.log(err);
   }
}

exports.generatePage = async (req, res) => {
   try {
      const isLogged = req.session.isLogged;
      const files = await File.find().lean();
      const generateErr = req.flash('generateErr')[0]
      res.render('generate', {
         title: 'Generate Sertificate',
         files: files.reverse(),
         error: generateErr,
         isLogged
      })
   } catch (err) {
      console.log(err);
   }
}

exports.generate = async (req, res) => {
   try {
      const { file } = req.body

      if (!file) {
         req.flash('generateErr', 'Fayl tanlanmadi!')
         return res.redirect('/islom/generate')
      }
      const fileBase = await File.findById(file).lean();
      const filePath = fileBase.file;
      const pathName = fileBase.fileName.split('_')[0];
      const users = [];
      const rows = await readXlsxFile(fs.createReadStream(`public${filePath}`));
      if (rows !== undefined) {
         let keys = rows[0], obj = {};
         for (let i = 1; i < rows.length; i++) {
            let item = rows[i];
            for (let j=0; j < item.length; j++) {
               obj[keys[j]] = item[j]
            }
            users.push(obj);
            if (pathName === 'davlat') {
               await renderGovernmentImage(obj, pathName)
            } else {
               await renderImage(obj, pathName)
            }
         }
      }

      res.redirect('/islom')
   } catch (err) {
      console.log(err);
   }
}

exports.deleteAll = async (req, res) => {
   try {
      const sertificates = await Sertificate.find();

      for (let i = 0; i < sertificates.length; i++) {
         const fileName = sertificates[i].file.split('/')[2];
         const currentPath = path.join(__dirname, '..', `public/create/${fileName}`)
         const movePath = path.join(__dirname, '..', `public/certificate/${fileName}`)
         fs.renameSync(currentPath, movePath);
      }

      await File.deleteMany()
      await Sertificate.deleteMany()

      res.redirect('/islom');
   } catch (err) {
      console.log(err);
   }
}

exports.exportPDF = async (req, res) => {
   try {
      await createPDF(res, unlinkFile);
   } catch (err) {
      console.log(err);
   }
}

async function renderImage(user, pathName) {
   try {
      const imgRaw = path.join(__dirname, '..', 'public', 'active', pathName, 'active.png');
      const font_42_path = path.join(__dirname, '..', 'public', 'fonts', 'font_42.ttf.fnt');
      const font_100_path = path.join(__dirname, '..', 'public', 'fonts', 'font_100.ttf.fnt');

      const font_42 = await Jimp.loadFont(font_42_path)
      const font_100 = await Jimp.loadFont(font_100_path)

      const fullNameTextData = {
         text: user.fullName.toUpperCase(),
         placementX: 140,
         placementY: 850
      }

      const idTextData = {
         text: `ID: ${user.id}`,
         placementX: 1860,
         placementY: 1320
      }

      const dateTextData = {
         text: moment(user.date).format('DD.MM.YYYY'),
         placementX: 1845,
         placementY: 1470
      }

      const url = `https://certificate.tezzkor.com/certificate/${user.id}.png`;

      const options = {
         type: 'png'
      };
      const outputPath = path.join(__dirname, '..', 'public', 'qr', `${user.id}.png`)
      await qr.toFile(outputPath, url, options);
      const image = await Jimp.read(imgRaw);
      const qrCodeUrl = path.join(__dirname, '..', 'public', 'qr', `${user.id}.png`);
      const qrImage = await Jimp.read(qrCodeUrl);
      qrImage.resize(314, 314);

      image.composite(qrImage, 1710, 100)

      image.print(
         font_100,
         fullNameTextData.placementX,
         fullNameTextData.placementY,
         fullNameTextData.text
      )

      image.print(
         font_42,
         idTextData.placementX,
         idTextData.placementY,
         idTextData.text
      )

      image.print(
         font_42,
         dateTextData.placementX,
         dateTextData.placementY,
         dateTextData.text
      )

      // /export/${pathName}/${user.fileName}_${user.id}.png
      await image.quality(100).writeAsync(path.join(__dirname, '..', 'public', 'create', `${user.id}.png`));

      await Sertificate.create({
         fullName: user.fullName,
         file: `/sertificate/${user.id}.png`,
         sertificateId: user.id
      })
      
   } catch (err) {
      console.log(err);
   }
}

async function renderGovernmentImage(user, pathName) {
   try {
      const imgRaw = path.join(__dirname, '..', 'public', 'active', pathName, 'active.png');
      const montserrat_40_path = path.join(__dirname, '..', 'public', 'fonts', 'montserrat_40.ttf.fnt');
      const montserrat_47_path = path.join(__dirname, '..', 'public', 'fonts', 'montserrat_47.ttf.fnt');
      const montserrat_100_path = path.join(__dirname, '..', 'public', 'fonts', 'montserrat_100.ttf.fnt');

      const montserrat_40 = await Jimp.loadFont(montserrat_40_path)
      const montserrat_47 = await Jimp.loadFont(montserrat_47_path)
      const montserrat_100 = await Jimp.loadFont(montserrat_100_path)

      const fullNameTextData = {
         text: user.fullName.toUpperCase(),
         placementX: 450,
         placementY: 730
      }

      const idTextData = {
         text: `ID: ${user.id}`,
         placementX: 2200,
         placementY: 1650,
      }

      const dateTextData = {
         text: moment(user.date).format('DD.MM.YYYY'),
         placementX: 1150,
         placementY: 1130
      }

      const url = `https://certificate.tezzkor.com/certificate/${user.id}.png`;

      const options = {
         type: 'png'
      };
      const outputPath = path.join(__dirname, '..', 'public', 'qr', `${user.id}.png`)
      await qr.toFile(outputPath, url, options);
      const image = await Jimp.read(imgRaw);
      const qrCodeUrl = path.join(__dirname, '..', 'public', 'qr', `${user.id}.png`);
      const qrImage = await Jimp.read(qrCodeUrl);
      qrImage.resize(314, 314);

      image.composite(qrImage, 2077, 110)

      image.print(montserrat_100, fullNameTextData.placementX, fullNameTextData.placementY, {
         text: fullNameTextData.text,
         alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
      }, 1640)

      image.print(
         montserrat_40,
         idTextData.placementX,
         idTextData.placementY,
         
      )

      image.print(
         montserrat_47,
         dateTextData.placementX,
         dateTextData.placementY,
         dateTextData.text
      )

      // /export/${pathName}/${user.fileName}_${user.id}.png
      await image.quality(100).writeAsync(path.join(__dirname, '..', 'public', 'create', `${user.id}.png`));

      await Sertificate.create({
         fullName: user.fullName,
         file: `/sertificate/${user.id}.png`,
         sertificateId: user.id
      })
      
   } catch (err) {
      console.log(err);
   }
}

exports.download = async (req, res) => {
   try {
      const zipFilePath = await createZipFile();

      res.download(zipFilePath, zipFileName, async function(err) {
         if (err) {
           req.flash('downloadErr', 'Fayl yuklab olishda xatolik yuz berdi')
         }
         await unlinkFile(zipFilePath);
      });
   } catch (err) {
      console.log(err);
   }
}

async function createZipFile() {
   const archive = archiver('zip', { zlib: { level: 9 }});
   const zipFilePath = path.join(__dirname, '..', 'public', `export/${zipFileName}`);

   // Fayllarni ZIP fayliga qo'shish
   archive.directory(publicPath, false);
 
   // ZIP faylini yaratish
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