const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000; // Use environment variable for port

// Serve static assets from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the service worker file
app.get('/service-worker.js', (req, res) => {
	res.sendFile(path.resolve(__dirname, 'public', 'service-worker.js'));
});

// Serve the manifest file
app.get('/manifest.json', (req, res) => {
	res.sendFile(path.resolve(__dirname, 'public', 'manifest.json'));
});

app.listen(port, () => {
	console.log(`Server listening on port http://localhost:${port}`);
});