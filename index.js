const express = require('express');
const dotenv = require('dotenv')
dotenv.config();
const app = express();
const flash = require('express-flash');
const session = require('express-session')
const exphbs = require('express-handlebars');
const MongoStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const expressFileUpload = require('express-fileupload');
const indexRoute = require('./routes')
const connectDB = require('./config/db')

const store = new MongoStore({
   uri: process.env.MONGO_URL,
   collection: 'session'
})

app.use(express.static('public'));
app.use(expressFileUpload());

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(session({
   secret: 'askdaksdhuy838djsnakdad',
   store: store,
   resave: true,
   saveUninitialized: true
}))
app.use(csrf());
app.use(flash());

app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

app.use((req, res, next) => {
   res.locals.csrfToken = req.csrfToken();
   next();
})

app.use('/', indexRoute);
app.get('*', (req, res) => {
   res.render('notfound.hbs', {
      title: 'Bunday sayt mavjud emas'
   })
})

const port = process.env.PORT || 4000;
app.listen(port, async () => {
   console.log(`Server running on port: ${port}`);
   await connectDB();
})