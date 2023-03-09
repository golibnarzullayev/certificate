const express = require('express');
const router = express.Router();

router.use('/', require('./sertificate.route'))
router.use('/auth', require('./auth.route'))

module.exports = router