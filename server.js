const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME,
  port: process.env.DB_PORT,
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL Database.');
});

// 創建 Profile
app.post('/api/profile', (req, res) => {
  const { address, name, email, phoneNumber } = req.body;
  const query = 'INSERT INTO profiles (address, name, email, phoneNumber) VALUES (?, ?, ?, ?)';
  
  db.query(query, [address, name, email, phoneNumber], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).send('Profile created.');
  });
});

app.put('/api/profile/:address', (req, res) => {
  const { name, email, phoneNumber } = req.body;
  const address = req.params.address;
  const query = 'UPDATE profiles SET name = ?, email = ?, phoneNumber = ? WHERE address = ?';

  db.query(query, [name, email, phoneNumber, address], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json({ message: 'Profile updated successfully.' });
  });
});

app.get('/api/profile/:address', (req, res) => {
  const address = req.params.address;
  const query = 'SELECT * FROM profiles WHERE address = ?';

  db.query(query, [address], (err, results) => {
    if (err) return res.status(500).send(err);
    res.status(200).json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});