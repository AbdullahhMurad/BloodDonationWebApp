import express from 'express';
import ejs from 'ejs';
import bodyParser from "body-parser";
// import pg from "pg";


const port = 3000;
const app = express();

app.set('view engine', 'ejs');

// app.use(express.static('public'));

app.use('/public',express.static('public'));


app.engine('html', ejs.renderFile);

app.get('/', (req, res) => {
  res.render('home.html', { });

});

app.get(['/', '/views/home.html'], (req, res) => {
  res.render('home.html', {});
});

app.get(['/', '/views/donors.html'], (req, res) => {
  res.render('donors.html', {});
});

app.get(['/', '/views/aboutus.html'], (req, res) => {
  res.render('aboutus.html', {});
});

app.get(['/', '/views/MyAccount.html'], (req, res) => {
  res.render('MyAccount.html', {});
});

app.get(['/', '/views/register.html'], (req, res) => {
  res.render('register.html', {});
});

app.get(['/', '/views/login.html'], (req, res) => {
  res.render('login.html', {});
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});