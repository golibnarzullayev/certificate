const express= require('express');
const { loginPage, registerUser, login, logOut } = require('../controllers/user.controller');
const { isAuth } = require('../middlewares/auth');
const router = express.Router();

router.get('/tizimga-kirish-judayam-qiyin', isAuth, loginPage)
router.get('/tizimdan-chiqish', logOut)
router.post('/tizimga-kirish-judayam-qiyin', login)
router.post('/tizimdan-ruyxatdan-utish-judayam-qiyin', registerUser)

module.exports = router;