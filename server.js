const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'fypProject',
  port: '3306'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL Database.');
});

app.post('/api/profile', (req, res) => {
  const { address, name, email, phoneNumber } = req.body;
  const query = 'INSERT INTO profiles (address, name, email, phoneNumber) VALUES (?, ?, ?, ?)';
  
  db.query(query, [address, name, email, phoneNumber], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).send('Profile created.');
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