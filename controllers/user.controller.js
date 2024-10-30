const User = require('../models/user.model')
const bcrypt = require('bcryptjs')

exports.loginPage = (req, res) => {
   const isLogged = req.session.isLogged;
   res.render('login', {
      title: 'Kirish',
      logErr: req.flash('logErr')[0],
      isLogged
   })
}

exports.registerUser = async (req, res) => {
   try {
      const { fullName, username, password } = req.body
      
      const userExist = await User.findOne({ username })

      if(userExist) {
         return res.status(400).json({ message: "Foydalanuvchi oldin ro'yxatdan o'tgan" })
      }

      if(password.length < 6) {
         return res.status(400).json({ message: "Parol kamida 6 ta belgidan iborat bo`lishi kerak" })
      }

      const hashPassword = await bcrypt.hash(password, 10)
      

      await User.create({
         fullName,
         username,
         password: hashPassword
      })

      return res.status(201).json({ message: "Success" })

   } catch (err) {
      console.log(err);
      
      throw new Error(err);
   }
}

exports.login = async (req, res) => {
   try {
      const { username, password } = req.body

      const userExist = await User.findOne({ username })

      if(!userExist) {
         req.flash('logErr', 'Ma`lumotlar mos kelmadi')
         return res.redirect('/auth/tizimga-kirish-judayam-qiyin')
      }

      const comparePass = await bcrypt.compare(password, userExist.password)
      if(!comparePass) {
         req.flash('logErr', 'Ma`lumotlar mos kelmadi')
         return res.redirect('/auth/tizimga-kirish-judayam-qiyin')
      }

      req.session.user = userExist
      req.session.isLogged = true
      res.redirect('/islom')
   } catch (err) {
      throw new Error(err);
   }
}

exports.logOut = async (req, res) => {
   req.session.user = null;
   req.session.isLogged = false;
   await req.session.destroy();
   res.redirect('/')
}