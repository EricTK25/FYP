const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer = require('multer');
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

// config multer 
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

//upload icon
app.post('/api/profile/icon/:address', upload.single('icon'), (req, res) => {
  const address = req.params.address;
  const iconData = Buffer.from(req.file.buffer).toString('base64'); 

  const sql = 'UPDATE profiles SET icon_data = ? WHERE address = ?';
  db.query(sql, [iconData, address], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send('Icon uploaded successfully');
  });
});


// 更新運送地址的 API
app.put('/api/profile/address/:account', (req, res) => {
  const { account } = req.params;
  const { shippingAddress } = req.body;

  if (!shippingAddress) {
    return res.status(400).json({ error: 'Shipping address is required' });
  }

  const query = 'UPDATE profiles SET shippingAddress = ? WHERE address = ?';
  db.query(query, [shippingAddress, account], (err, results) => {
    if (err) {
      console.error('Error updating shipping address:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.status(200).json({ message: 'Shipping address updated successfully' });
  });
});

//get icon
app.get('/api/profile/icon/:address', (req, res) => {
  const address = req.params.address;
  const sql = 'SELECT icon_data FROM profiles WHERE address = ?';

  db.query(sql, [address], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) return res.status(404).send('Icon not found');

    const base64Image = result[0].icon_data; 
    res.json({ icon: base64Image }); 
  });
});


//Profile
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