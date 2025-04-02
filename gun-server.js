const express = require('express');
const Gun = require('gun');
const cors = require('cors');
const mysql = require('mysql');
require('dotenv').config();

const app = express();
const port = 5050;

app.use(cors());
app.use(Gun.serve); // Serve Gun.js

// MySQL database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME,
  port: process.env.DB_PORT
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    throw err;
  }
  console.log('Connected to MySQL Database from Gun.js server!!!!!!!!!.');
});

// Initialize Gun instance
const gun = Gun();

// Real-time data handler
gun.get('carriers').on(data => {
  console.log('CMD Update:', data);
});

// SQL DATABASE ENDPOINTS
app.get('/data', (req, res) => {
  console.log('Received request to /data');
  
  const query = 'SELECT * FROM profiles';
  
  console.log('Starting query:', query);
  
  db.query(query, (err, results) => {
    console.log('Query completed.');
    
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).send(err);
    }
    
    console.log('Query Results:', results);
    
    // Update GunDB with MySQL data
    gun.get('carriers').put(results);
    
    res.json(results);
  });
});


// user->gun->mysql END POINT
app.post('/data', express.json(), (req, res) => {
  const newProfile = req.body;

  if (!newProfile) {
    return res.status(400).send('Invalid profile data');
  }

  console.log('Received new profile:', newProfile);

  // Insert the new profile into the MySQL database
  db.query(
    "INSERT INTO profiles (name, email, phoneNumber, address) VALUES (?, ?, ?, ?)",
    [newProfile.name, newProfile.email, newProfile.phoneNumber, newProfile.address=0x0],
    (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send('Failed to add profile to the database');
      }

      console.log('Profile added to database:', results);

      // Optionally, update GunDB with the new profile
      gun.get('profiles').set(newProfile);

      res.status(200).send('Profile added successfully');
    }
  );
});

const server = app.listen(port, () => {  
  console.log(`Server running on port ${port}`);
});

 
// Attach Gun to server
Gun({ web: server });
