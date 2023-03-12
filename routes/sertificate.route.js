const express = require('express');
const router = express.Router();
const { homePage, uploadPage, upload, generatePage, generate, deleteAll, download, exportPDF } = require('../controllers/sertificate.controller');
const { protected } = require('../middlewares/auth')

router.get('/', (req, res) => {
   res.render('homepage', {
      title: "Home page"
   })
})
router.get('/islom', protected, homePage)
router.get('/islom/upload', protected, uploadPage)
router.get('/islom/download', protected, download)
router.get('/islom/export-pdf', protected, exportPDF)
router.post('/upload', protected, upload)
router.get('/islom/generate', protected, generatePage)
router.post('/generate', protected, generate)
router.post('/delete', protected, deleteAll)

module.exports = router