var express = require("express");
var app = express();
app.set("port", process.env.PORT || 3001);    // || const PORT = process.env.PORT || 3000;
const PORT = process.env.PORT || 3001;

//MongoDB
const mongoose = require('mongoose');

// custom functionality
var fortune = require('./lib/fortune.js');

// Установка механизма представления handlebars
var handlebars = require("express-handlebars").create({
  defaultLayout: "main",           //указываем макет по умолчанию
  //defaultLayout: "imgPloadr",        // imgPloadr_1   //#Error: The partial stats could not be found

  extname: 'hbs',         //extension define
  helpers: {
    section: function (name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    },
  },
});   

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');

//
app.use(express.static(__dirname + '/public'));

// set 'showTests' context property if the querystring contains test=1
app.use(function(req, res, next){
	res.locals.showTests = app.get('env') !== 'production' && 
		req.query.test === '1';
	next();
});

app.get('/', function(req, res){
    //res.type('text/plain');
    //res.send('Meadowlark Travel');

    res.render('home');

    //to get all registered routes in Express
    app._router.stack.forEach(function(r){
      if (r.route && r.route.path){
        console.log(r.route.path)
      }
    })
});

//  imgPreloadr_2 [WebDev]
app.get('/img', function(req, res){
  // res.type('text/plain');
  // res.send('Meadowlark Travel');

  // res.render('home');
  res.render('imgPloadr/stats');
});

app.get('/about', function(req, res){
    // res.type('text/plain');
    // res.send('О Meadowlark Travel');

    //let randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];       
    //res.render('about', { fortune: randomFortune });
    res.render('about', { 
      fortune: fortune.getFortune(),
      pageTestScript: '/qa/tests-about.js'
    });
});

// +tours
app.get("/tours/hood-river", function (req, res) {
  res.render("tours/hood-river");
});
app.get("/tours/request-group-rate", function (req, res) {
  res.render("tours/request-group-rate");
});

// #6 Заголовки запросов
app.get("/headers", function (req, res) {
  // res.send('200', '<h1>HTTP Headers</h1>');
  res.set("Content-Type", "text/plain");
  var s = "";
  for (var name in req.headers) s += name + ": " + req.headers[name] + "\n";
  res.send(s);
});
app.get("/error", function (req, res) {
  res.status(500);
  res.render('error');
});
app.get("/greeting", function (req, res) {
  res.render("about", {
    message: "welcome",
    style: req.query.style,
    userid: req.cookie.userid,
    username: req.session.username,
  });
});
app.get("/text", function (req, res) {
  res.type("text/plain");
  res.send("это тест");
});

var tours = [
  { id: 0, name: 'Река Худ', price: 99.99 },
  { id: 1, name: 'Орегон Коуст', price: 149.95 },
  { id: 2, name: 'Река Худ', price: 99.99 },
  { id: 3, name: 'Орегон Коуст', price: 149.95 },
];
app.get('/api/tours', function(req, res){
    res.json(tours);
});
app.get('/api/tours2', function(req, res){
  var toursXml = '<?xml version="1.0"?><tours>' +
    tours.map(function(p){
      return '<tour price="' + p.price +
      '" id="' + p.id + '">' + p.name + '</tour>';
    }).join('') + '</tours>';
  var toursText = tours.map(function(p){
    return p.id + ': ' + p.name + ' (' + p.price + ')';
  }).join('\n');
    res.format({
      'application/json': function(){
      res.json(tours);
    },
    'application/xml': function(){
      res.type('application/xml');
      res.send(toursXml);
    },
    'text/xml': function(){
      res.type('text/xml');
      res.send(toursXml);
    },
      'text/plain': function(){
      res.type('text/plain');
      res.send(toursXml);
    }
  });
});



//Form processing #1
app.use(require('body-parser'). urlencoded({ extended: true }));
  app.get('/newsletter', function(req, res){
  // мы изучим CSRF позже... сейчас мы лишь
  // заполняем фиктивное значение
  res.render('newsletter', { csrf: 'CSRF token goes here' });
});
app.post('/process' , function(req, res){
  console.log('Form (from querystring): ' + req.query. form);
  console.log('CSRF token (from hidden form field): ' + req.body._csrf);
  console.log('Name (from visible form field): ' + req.body.name);
  console.log('Email (from visible form field): ' + req.body.email);
  res.redirect(303, '/thank-you' );
});



// пользовательская страница 404
app.use(function (req, res) {
  //res.type("text/plain");
  res.status(404);
  //res.send("404 — Не найдено. Check out.");

  res.render('404');
});

// пользовательская страница 500
app.use(function (err, req, res, next) {
  console.error(err.stack);
  //res.type("text/plain");
  res.status(500);
  //res.send("500 — Ошибка сервера");

  res.render('500');
});



// app.listen(app.get("port"), function () {
//   console.log(
//     "Express запущен на http://localhost:" +
//       app.get("port") + "; нажмите Ctrl+C для завершения."
//   );
// });

// +MDB [VladMinin] https://www.youtube.com/watch?v=8bE_PBRriyU&list=PL0vcON9kQxAtaKb3nZH47xDK24_tSqCx1&index=73
async function start() {
  try {
    await mongoose.connect('mongodb+srv://sergey_man:mongo_235@cluster0.9ioww.mongodb.net/<dbname>?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useFindAndModify: false
    })
    app.listen(PORT, () => {
      console.log('Server has been started on port ' + PORT + ' (start(), connected to Mongo Atlas) WORKS!...');
    })
  }
  catch(e) {
    console.log('Ошибка в start(): ', e);
  }
}
start();


/*
Это базовое приложение для изучения работы Node.js/Express.js
[]
[]
[]
https://www.youtube.com/watch?v=8bE_PBRriyU&list=PL0vcON9kQxAtaKb3nZH47xDK24_tSqCx1&index=73

MDB user
sergey_man  mongo_235
connect string:
               user     : pass                                 collection ?query-params
mongodb+srv://sergey_man:<password>@cluster0.9ioww.mongodb.net/<dbname>?retryWrites=true&w=majority
mongodb+srv://vladilen:1q2w3e4r@cluster0-ua4e7.mongodb.net/todos      //Not working
*/