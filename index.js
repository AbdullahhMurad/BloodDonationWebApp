import express from 'express';
import ejs from 'ejs';
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from 'bcrypt';

const port = 3000;
const app = express();

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "HopeDrops",
  password: "Alhamdulillah",
  port: 5432,
});
db.connect();





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

// Step 8: I have successfully created the post route for the register.ejs, data gets inserted successfully,
//         but the user is not being directed to the home page

// lmao, the user was not being directed to the home page because of the order of the routes
// order matters in express


app.use('/public',express.static('public'));


// app.engine('html', ejs.renderFile);
app.engine('ejs', ejs.renderFile);

// Make sure you place this after initializing the app
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());






const getBloodTypeText = (bloodType) => {
  // Optionally, you can check if the blood type is one of the expected values
  const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  if (validBloodTypes.includes(bloodType)) {
      return bloodType;
  } else {
    return 'Unknown Blood Type';
  }
};

// This is the register post route that will be used

app.post('/register', async (req, res)=> {
 
  const full_name = req.body.full_name;
  const email = req.body.email; 
  const phone_number = req.body.phone_number;
  const password = req.body.password;
  const blood_type = req.body.blood_type;
  const city_name = req.body.city;


  console.log(full_name);
  console.log(email);
  console.log(password);
 
  try {


       const existingRecord = await db.query('SELECT * FROM donors WHERE email = $1', [email]);
     
       if (existingRecord.rows.length > 0) {
         // User with given email already exists
         res.status(400).send(`User with the email: ${email} already exists`);
        

     } else {
         // Hash the password
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password, salt);
         
         console.log(salt);
         console.log(hashedPassword);
 
         const result = await db.query(
         "INSERT INTO DONORS (full_name, email, phone_number, password, blood_type, city_name) VALUES ($1, $2, $3, $4, $5, $6)",
         [full_name, email, phone_number, hashedPassword, blood_type, city_name]);
        //  res.render("secrets");
        res.render("home");
     }
 
  } catch (error) {
     console.log(error);
  }
 
 });




app.post("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
 
    console.log(password);
 
    try {
        const result = await db.query(
            "SELECT * FROM DONORS WHERE email = $1",
            [email]
        );
 
        if (result.rows.length > 0) {
            const donor = result.rows[0];
      
            if(!email.includes("@gmail") || !email.includes("@hotmail") || !email.includes("@icloud") ){
                      res.status(400).send('Enter a valid email!');  
                }  
      
                // Compare the password
            const validPassword = await bcrypt.compare(password, donor.password);
            if (validPassword) {
                console.log(donor.password);
                res.redirect("home");
            } else {
                res.status(400).send('Incorrect password!');
            }
        } else {
          res.status(400).send('User does not exist');
        }
          // if (result.rows.length<0){
          //   res.status(400).send("User does not exist")
          // }  
    } catch (error) {
        console.log(error);
    }
});



// app.post for the login form without before importing bcrypt

// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;

  
//   try {
//     const result = await db.query(
//       'SELECT * FROM donors WHERE email = $1 AND password = $2',
//       [email, password]
//     );

//     if (result.rows.length > 0) {
//       // res.send('Login successful');
//       res.redirect('/home');
//     } else {
//       res.send('Invalid email or password');
//       // alert("'Invalid email or password'");
//     }
//   } catch {
//     res.sendStatus(500).send('Error');
//   }
// });







app.post('/donors', async (req, res) => {
  try {
    const { bloodType, city } = req.body;
    console.log('Blood Type:', bloodType);
    console.log('City:', city);

    // Added ILIKE for case insensitivity
    // ILIKE = is a syntax error
    let query = 'SELECT * FROM donors WHERE city_name ILIKE $1';
    const params = [city];

    if (bloodType) {
      const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
      const bloodTypeIndex = bloodTypes.indexOf(bloodType);
      
      if (bloodTypeIndex !== -1) {
        const compatibleBloodTypes = getCompatibleBloodTypes(bloodType);
        query += ` AND blood_type IN (${compatibleBloodTypes.map((_, i) => `$${i + 2}`).join(', ')})`;
        params.push(...compatibleBloodTypes);
      }
    }

    console.log('SQL Query:', query);
    console.log('Parameters:', params);

    const donorsResult = await db.query(query, params);
    const donors = donorsResult.rows;

    // Render the donors.ejs view
    res.render('donors.ejs', { blood_type: bloodType, city_name: city, donors: donors, getBloodTypeText: getBloodTypeText });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});




// Add the following function to generate the SQL query based on selected criteria
const generateDonorsQuery = (bloodType, city) => {
  let query = 'SELECT * FROM donors WHERE city_name = $1';
  const params = [city];

  if (bloodType) {
    // Modify this part based on your compatibility criteria
    const compatibleBloodTypes = getCompatibleBloodTypes(bloodType);
    const bloodTypeCondition = compatibleBloodTypes.map((_, index) => `$${index + 2}`).join(', ');

    query += ` AND blood_type IN (${bloodTypeCondition})`;
    params.push(...compatibleBloodTypes);
  }

  return { query, params };
};














// Function to get compatible blood types
const getCompatibleBloodTypes = (selectedBloodType) => {
  const bloodTypeMap = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    'AB-': ['A-', 'B-', 'O-', 'AB-']
  };

  return bloodTypeMap[selectedBloodType] || [];
};

// The variable is never read, so this statement might get deleted
const bloodTypeMapping = {
  1: 'A+',
  2: 'A-',
  3: 'B+',
  4: 'B-',
  5: 'AB+',
  6: 'AB-',
  7: 'O+',
  8: 'O-',
};




//Test
app.get('/donors', async (req, res) => {
  try {
    // Query the database to get distinct blood types
    const bloodTypesResult = await db.query('SELECT DISTINCT blood_type FROM donors');
    const bloodTypes = bloodTypesResult.rows;

    // Query the database to get all cities
   
    const citiesResult = await db.query('SELECT * FROM city');
    // const citiesResult = await db.query('SELECT city_name from donors')
    const cities = citiesResult.rows;

    // Query the database to get a default set of 12 donors
    // Make sure the limit is 12 or a closer number to that amount to display donors informaion by default 
    // prior to the users request
    const defaultDonorsResult = await db.query('SELECT * FROM donors LIMIT 12');
    const defaultDonors = defaultDonorsResult.rows;

    // Render the donors.ejs view and pass the blood types, cities, and default donors as variables
    res.render('donors.ejs', { blood_type: bloodTypes, city: cities, donors: defaultDonors, getBloodTypeText: getBloodTypeText, getCompatibleBloodTypes: getCompatibleBloodTypes});
  } catch (error) {
    console.error('Error fetching data:', error);
    // Handle other errors if needed
    res.status(500).send('Internal Server Error');
  }
});


app.get('/home', async (req, res) => {
  res.render('home.ejs', {}); // Adjust this line based on your template and data
});


// GET Routes

app.get('/', (req, res) => {
  res.render('home.ejs', { });

});
app.get('/aboutus', (req, res) => {
  res.render('aboutus.ejs', {});
});

app.get('/donors', (req, res) => {
  res.render('donors.ejs', {});
});

app.get('/home', (req, res) => {
  res.render('home.ejs', {});
});

app.get('/login', (req, res) => {
  res.render('login.ejs', {});
});

app.get('/MyAccount', (req, res) => {
  res.render('MyAccount.ejs', {});
});

app.get('/register', (req, res) => {
  res.render('register.ejs', {});
});

app.get('/search', (req, res) => {
  res.render('search.ejs', {});
});


// Test

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

app.get('/views/search.ejs', (req, res) => {
  res.render('search.ejs', {});
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
