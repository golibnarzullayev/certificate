const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");
const Certificate = require("../models/certificate.model");
const File = require("../models/file.model");
const util = require("util");
const { createPDF } = require("../utils/createPdf");
const zipFileName = "public_files.zip";
const unlinkFile = util.promisify(fs.unlink);
const textData = require("../utils/textData");
const renderImage = require("../utils/renderImage");
const createZipFile = require("../utils/createZipFile");
const EventEmitter = require("events");

exports.homePage = async (req, res) => {
  try {
    const isLogged = req.session.isLogged;
    const downloadErr = req.flash("downloadErr")[0];
    const sertificates = await Certificate.find().lean();
    res.render("home", {
      title: "Bosh sahifa",
      sertificates: sertificates.reverse(),
      error: downloadErr,
      isLogged,
    });
  } catch (err) {
    throw new Error(err);
  }
};

exports.uploadPage = async (req, res) => {
  try {
    const isLogged = req.session.isLogged;
    const uploadErr = req.flash("uploadErr")[0];
    res.render("upload", {
      title: "Fayl yuklash",
      error: uploadErr,
      isLogged,
    });
  } catch (err) {
    throw new Error(err);
  }
};

exports.upload = async (req, res) => {
  try {
    const uploadFolderExists = fs.existsSync("public/upload");
    if (!uploadFolderExists) {
      fs.mkdirSync("public/upload");
    }

    if (!req.files) {
      req.flash("uploadErr", "fayl yuklanmagan");
      return res.redirect("/islom/upload");
    }

    const excelFile = req.files.file;

    if (excelFile.size > 5000000) {
      req.flash("uploadErr", "Fayl hajmi juda katta");
      return res.redirect("/islom/upload");
    }

    excelFile.name = `excel_file_${Date.now()}${
      path.parse(excelFile.name).ext
    }`;
    const { course } = req.body;

    if (!course) {
      req.flash("uploadErr", "Kurs tanlanmadi");
      return res.redirect("/islom/upload");
    }

    excelFile.mv(`public/upload/${excelFile.name}`, async (err) => {
      if (err) {
        req.flash("uploadErr", "Fayl yuklanmadi");
        return res.redirect("/islom/upload");
      }
    });

    await File.create({
      fileName: `${course}_${new Date().getTime()}`,
      file: `/upload/${excelFile.name}`,
    });

    res.redirect("/islom/generate");
  } catch (err) {
    throw new Error(err);
  }
};

exports.generatePage = async (req, res) => {
  try {
    const isLogged = req.session.isLogged;
    const files = await File.find().lean();
    const generateErr = req.flash("generateErr")[0];
    res.render("generate", {
      title: "Generate Certificate",
      files: files.reverse(),
      error: generateErr,
      isLogged,
    });
  } catch (err) {
    throw new Error(err);
  }
};

exports.generate = async (req, res) => {
  try {
    const { file } = req.body;

    if (!file) {
      req.flash("generateErr", "Fayl tanlanmadi!");
      return res.redirect("/islom/generate");
    }
    async function generatedWebSocket() {
      const fileBase = await File.findById(file).lean();
      const filePath = fileBase.file;
      const pathName = fileBase.fileName.split("_")[0];
      const workbook = xlsx.readFile(`public${filePath}`);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(worksheet);

      if (rows !== undefined) {
        for (let i = 0; i < rows.length; i++) {
          let item = rows[i];
          const data = textData(item, pathName);
          if (pathName === "davlat") {
            await renderImage(pathName, data, "davlat");
          } else {
            await renderImage(pathName, data, "other");
          }
        }
      }

      res.redirect("/islom");
    }

    const eventEmitter = new EventEmitter();
    eventEmitter.on("generate", generatedWebSocket);
    eventEmitter.emit("generate");
  } catch (err) {
    throw new Error(err);
  }
};

exports.deleteAll = async (req, res) => {
  try {
    const files = await File.find();
    const certificates = await Certificate.find();

    for (let i = 0; i < certificates.length; i++) {
      const certificateBaseName = certificates[i].file.split("/")[2];
      const createPath = path.join(
        __dirname,
        "..",
        `public/create/${certificateBaseName}`
      );

      if (fs.existsSync(createPath)) {
        fs.unlinkSync(createPath);
      }
    }

    for (let i = 0; i < files.length; i++) {
      const fileName = files[i].file.split("/")[2];

      const filePath = path.join(__dirname, "..", `public/upload/${fileName}`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await File.deleteMany();
    await Certificate.deleteMany();

    res.redirect("/islom");
  } catch (err) {
    throw new Error(err);
  }
};

exports.exportPDF = async (req, res) => {
  try {
    await createPDF(res, unlinkFile);
  } catch (err) {
    throw new Error(err);
  }
};

exports.download = async (req, res) => {
  try {
    const zipFilePath = await createZipFile(zipFileName);

    res.download(zipFilePath, zipFileName, async function (err) {
      if (err) {
        req.flash("downloadErr", "Fayl yuklab olishda xatolik yuz berdi");
      }
      await unlinkFile(zipFilePath);
    });
  } catch (err) {
    throw new Error(err);
  }
};
