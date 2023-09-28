const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('folder'));

const admin = require('firebase-admin');
var serviceAccount = require("./key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore(); // Initialize Firestore

// Your existing routes
app.get('/signup', function (req, res) {
  res.sendFile(__dirname + "/folder/" + "signup.html");
});

app.get('/login', function (req, res) {
  res.sendFile(__dirname + "/folder/" + "login.html");
});

app.get('/products', function (req, res) {
  res.sendFile(__dirname + "/folder/" + "products.html");
});

// New user registration route with password hashing
app.post('/signup', async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  try {
    // Check if the email already exists in Firestore
    const userRef = db.collection('output').doc(username);
    const docSnapshot = await userRef.get();

    if (docSnapshot.exists) {
      res.send("Email already registered. Please choose a different one.");
    } else {
      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(password, 10);

      // Email is unique, proceed with registration
      const userData = {
        FullName: username,
        Password: hashedPassword,
      };

      await userRef.set(userData);

      res.send("Registration successful. Please login.");
    }
  } catch (error) {
    res.status(500).send("Error: " + error);
  }
});

// New user login route with password hashing
app.post("/login", async function (req, res) {
  const name = req.body.username;
  const password = req.body.password;

  try {
    const userRef = db.collection('output').doc(name);
    const docSnapshot = await userRef.get();

    if (docSnapshot.exists) {
      const hashedPassword = docSnapshot.data().Password;

      // Compare the entered password with the hashed password from Firestore
      const result = await bcrypt.compare(password, hashedPassword);

      if (result) {
        // Redirect to the products page on successful login
        res.redirect('/products');
      } else {
        res.send("Fail");
      }
    } else {
      res.send("Fail");
    }
  } catch (error) {
    res.status(500).send("Error: " + error);
  }
});

app.listen(7008, function () {
  console.log('Server is running on port 7008');
});