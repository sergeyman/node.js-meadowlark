var express = require("express");
var app = express();
app.set("port", process.env.PORT || 3001);

var fortune = require('./lib/fortune.js');

// Установка механизма представления handlebars
var handlebars = require('express-handlebars')
    .create({ defaultLayout:'main' });                  //указываем макет по умолчанию
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');

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
});

app.get('/about', function(req, res){
    // res.type('text/plain');
    // res.send('О Meadowlark Travel');

    //let randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];       
    //res.render('about', { fortune: randomFortune });
    res.render('about', { fortune: fortune.getFortune() });
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


app.listen(app.get("port"), function () {
  console.log(
    "Express запущен на http://localhost:" +
      app.get("port") + "; нажмите Ctrl+C для завершения."
  );
});
