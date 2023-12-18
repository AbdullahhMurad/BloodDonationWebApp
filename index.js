import express from 'express';
import ejs from 'ejs';
import bodyParser from "body-parser";
// import pg from "pg";




const port = 3000;
const app = express();

app.set('view engine', 'ejs');

// app.use(express.static('public'));

// Step 1: Organize the directories

// Step 2: Create the GET routes in order to be able to navigate between the pages and connect the frontend
// with the backend

// Step 3: Convert the html files into ejs, just in case

// Step 4: Starting with the register.ejs, serve the page in the backend, render the ejs, and pass the objects

// Step 5: For form tags, use buttons instead of anchor tags

// Step 6: Add Validation Rules

// Validation Rules have been implemented, revise the MyAccount.ejs page, why is there no button? How will the changes be saved?

// Step 7: Create separate files for the header, footer, and statistics, and include them in each ejs file

// Since we used the ejs tag include, the website seems to be more dynamic

app.use('/public',express.static('public'));


app.engine('html', ejs.renderFile);

// Make sure you place this after initializing the app
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Serve the Register 
app.post('/register', (req, res) => {
    
  const { fullname, email, phonenumber, password, bloodType, governorate, majorGeneral } = req.body;

  // res.redirect('/registration-success');
  // res.redirect('home.ejs');

  res.render("home.ejs");

});


// GET Routes

app.get('/', (req, res) => {
  res.render('home.ejs', { });

});

// Test

app.get('/views/home.ejs', (req, res) => {
  res.render('home.ejs', {});
});



app.get('/views/home.ejs', (req, res) => {
  res.render('home.ejs', {});
});

app.get('/views/donors.ejs', (req, res) => {
  res.render('donors.ejs', {});
});

app.get('/views/aboutus.ejs', (req, res) => {
  res.render('aboutus.ejs', {});
});

app.get('/views/MyAccount.ejs', (req, res) => {
  res.render('MyAccount.ejs', {});
});

app.get('/views/register.ejs', (req, res) => {
  res.render('register.ejs', {});
});

app.get('/views/login.ejs', (req, res) => {
  res.render('login.ejs', {});
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
