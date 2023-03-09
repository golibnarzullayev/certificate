const express = require('express');
const router = express.Router();
const { homePage, uploadPage, upload, generatePage, generate, deleteAll, download } = require('../controllers/sertificate.controller');
const { protected } = require('../middlewares/auth')

router.get('/islom', protected, homePage)
router.get('/islom/upload', protected, uploadPage)
router.get('/islom/download', protected, download)
router.post('/upload', protected, upload)
router.get('/islom/generate', protected, generatePage)
router.post('/generate', protected, generate)
router.post('/delete', protected, deleteAll)

module.exports = router