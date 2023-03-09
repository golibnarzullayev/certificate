const isAuth = (req, res, next) => {
   if(req.session.isLogged) {
      return res.redirect('/islom')
   }
   next()
}

const protected = (req, res, next) => {
   console.log(req.session.isLogged);
   if(!req.session.isLogged) {
      return res.redirect('/')
   }
   next()
}

module.exports = {
   isAuth,
   protected
}