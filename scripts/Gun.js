const Gun = require('gun');
const express = require('express');

const app = express();
const port = 8765; // You can choose any available port

// Serve Gun.js
app.use(Gun.serve);

// Start the server
const server = app.listen(port, () => {
    console.log(`Gun.js server running on http://localhost:${port}/gun`);
});

// Initialize Gun
const gun = Gun({ web: server });
