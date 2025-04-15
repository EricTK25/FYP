const express = require('express');
const Gun = require('gun');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME,
  port: process.env.DB_PORT
});

// Initialize Gun.js
const gun = Gun({
  peers: ['http://localhost:8765/gun'] // Replace with the Gun.js peer URL
});

// API to create a profile
app.post('/api/profile', (req, res) => {
  const { address, name, email, phoneNumber } = req.body;

  if (!address || !name || !email || !phoneNumber) {
    return res.status(400).send('Missing required fields.');
  }

  gun.get('profiles').get(address).put({ name, email, phoneNumber }, ack => {
    if (ack.err) return res.status(500).send(ack.err);
    res.status(200).send('Profile created.');
  });
});

// API to get a profile by address
app.get('/api/profile/:address', (req, res) => {
  const address = req.params.address;

  gun.get('profiles').get(address).once((data) => {
    if (!data) return res.status(404).send('Profile not found.');
    res.status(200).json(data);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
