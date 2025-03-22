// web.js

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({ msg: 'Bot responding to GET request!' });
});

app.post('/api/cmd', (req, res) => {
  const { cmd } = req.body;
  res.json({ msg: `Cmd received: ${cmd}` });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error occurred!' });
});

// Start server
app.listen(PORT, () => console.log(`Web server on port ${PORT}`));

module.exports = app;
