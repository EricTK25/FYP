const express = require('express');
const Gun = require('gun');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

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

//shipping address update API
app.put('/api/profile/address/:account', (req, res) => {
  const { account } = req.params;
  const { shippingAddress } = req.body;

  if (!shippingAddress) {
    return res.status(400).json({ error: 'Shipping address is required' });
  }

  const userNode = gun.get(`user_${account}`).get('profile');

  userNode.once((data) => {
    if (!data) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    userNode.put({ shippingAddress }, (ack) => {
      if (ack.err) {
        console.error('Error updating shipping address:', ack.err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(200).json({ message: 'Shipping address updated successfully' });
    });
  });
});

//updata profile API
app.put('/api/profile/address:account', (req, res) => {
  const { account } = req.params;
  const { name, email, phoneNumber } = req.body;

  if (!name || !email || !phoneNumber) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const userNode = gun.get(`user_${account}`).get('profile');

  userNode.once((data) => {
    if (!data) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    userNode.put({ name, email, phoneNumber }, (ack) => {
      if (ack.err) {
        console.error('Error updating profile:', ack.err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(200).json({ message: 'Profile updated successfully' });
    });
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});