var express = require("express");
var app = express();
app.set("port", process.env.PORT || 3001);

// Установка механизма представления handlebars
var handlebars = require('express-handlebars')
    .create({ defaultLayout:'main' });                  //указываем макет по умолчанию
app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');
app.set('views', './views');

app.use(express.static(__dirname + '/public'));

var fortunes = [
    "Победи свои страхи, или они победят тебя.",
    "Рекам нужны истоки.",
    "Не бойся неведомого.",
    "Тебя ждет приятный сюрприз.",
    "Будь проще везде, где только можно.",
];

app.get('/', function(req, res){
    //res.type('text/plain');
    //res.send('Meadowlark Travel');

    res.render('home');
});

app.get('/about', function(req, res){
    // res.type('text/plain');
    // res.send('О Meadowlark Travel');

    let randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
       
    res.render('about', { fortune: randomFortune });
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
