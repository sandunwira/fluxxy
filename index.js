const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
var favicon = require('serve-favicon');
const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static('public'));

// Favicon Start
app.use(favicon(path.join(__dirname, 'public', 'assets', 'images', 'logos', 'logo.png')));
// Favicon End

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
	res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});


let onlineCount = 0;

io.on('connection', (socket) => {
	console.log('New WebSocket Connection');
	onlineCount++;
	io.emit('onlineCount', onlineCount);

	socket.on('chatMessage', (msg) => {
		io.emit('chatMessage', msg);
	});

	socket.on('disconnect', () => {
		onlineCount--;
		io.emit('onlineCount', onlineCount);
	});

	console.log('Online Users:', onlineCount);
});


// Serve the service worker file
app.get('/service-worker.js', (req, res) => {
	res.sendFile(path.resolve(__dirname, 'public', 'service-worker.js'));
});

// Serve the manifest file
app.get('/manifest.json', (req, res) => {
	res.sendFile(path.resolve(__dirname, 'public', 'manifest.json'));
});


server.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});