const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
var favicon = require('serve-favicon');
const port = process.env.PORT || 3000;
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const io = socketio(server);


// Cookie Configuration Start
app.use(cookieParser());
// Cookie Configuration End

// Database Configuration Start
const db = new sqlite3.Database('fluxxy.db');
db.serialize(() => {
	console.log('Database Connected Successfully!\n-> fluxxy.db\n');
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Database Configuration End


app.use(express.static('public'));

// Favicon Start
app.use(favicon(path.join(__dirname, 'public', 'assets', 'images', 'logos', 'logo.png')));
// Favicon End

app.get('/', (req, res) => {
	if (req.cookies.email) {
		res.redirect('/chat');
	} else {
		res.sendFile(path.join(__dirname, 'public', 'index.html'));
	}
});

app.get('/login', function(req, res) {
	if (req.cookies.email) {
		res.redirect('/chat');
	} else {
		res.sendFile(path.join(__dirname, 'public', 'login.html'));
	}
});
app.get('/register', function(req, res) {
	if (req.cookies.email) {
		res.redirect('/chat');
	} else {
		res.sendFile(path.join(__dirname, 'public', 'register.html'));
	}
});

app.get('/chat', function(req, res) {
	if (req.cookies.email) {
		res.sendFile(path.join(__dirname, 'public', 'chat.html'));
	} else {
		res.redirect('/login');
	}
});



let onlineCount = 0;

io.on('connection', (socket) => {
	console.log('WebSocket Connected :D');
	onlineCount++;
	io.emit('onlineCount', onlineCount);

	socket.on('chatMessage', (msg) => {
		io.emit('chatMessage', msg);
	});

	socket.on('disconnect', () => {
		onlineCount--;
		io.emit('onlineCount', onlineCount);
		console.log('WebSocket Disconnected :O\nOnline Users:', onlineCount);
	});

	console.log('Online Users:', onlineCount);
});



// Register User Start
app.post('/userRegister', (req, res) => {
	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;
	const confirmPassword = req.body.confirmPassword;
	const timestamp = new Date().getDate() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear() + ' ' + new Date().toTimeString().slice(0, 5);

	if (password === confirmPassword) {
		// Check if email already exists in the database
		db.get('SELECT email FROM users WHERE email = ?', [email], (err, row) => {
			if (err) {
				console.error('Error querying database:', err.message);
				res.status(500).send('Error querying database :(');
				return;
			}

			if (row) {
				// If the SELECT statement returned a row, the email already exists
				console.error('Email already exists');
				res.status(500).send(`<script>alert('Email already exists'); window.history.back();</script>`);
				return;
			}

			// If the SELECT statement didn't return a row, the email doesn't exist and we can insert the new user
			db.run('INSERT INTO users (name, email, password, timestamp) VALUES (?, ?, ?, ?)', [name, email, password, timestamp], (err) => {
				if (err) {
					console.error('Error Saving Data To Database:', err.message);
					res.status(500).send('Error Saving Data To Database :(');
					return;
				}

				console.log('Data Saved To Database :)');

				// HTML To Display Thanks & Submitted Data To User
				let userRegisterHtml = `
					<!DOCTYPE html>
					<html>

					<head>
						<meta charset="UTF-8">
						<meta http-equiv="X-UA-Compatible" content="IE=edge">
						<meta name="viewport" content="width=device-width, initial-scale=1">
						<meta name="theme-color" content="#2695D4">

						<title>Welcome - Fluxxy</title>

						<!-- SEO Start =================================================================================-->
						<meta name="title" content="Welcome - Fluxxy">
						<meta name="description" content="Fluxxy is an open source website to share texts and many more with the people around the world, no matter where you are.">
						<!-- Open Graph -->
						<meta property="og:type" content="website">
						<meta property="og:url" content="">
						<meta property="og:title" content="Welcome - Fluxxy">
						<meta property="og:description" content="Fluxxy is an open source website to share texts and many more with the people around the world, no matter where you are.">
						<meta property="og:image" content="https://i.postimg.cc/1XbsDBhv/preview.png">
						<!-- Twitter -->
						<meta name="twitter:card" content="summary_large_image">
						<meta name="twitter:url" content="">
						<meta name="twitter:title" content="Welcome - Fluxxy">
						<meta name="twitter:description" content="Fluxxy is an open source website to share texts and many more with the people around the world, no matter where you are.">
						<meta name="twitter:image" content="https://i.postimg.cc/1XbsDBhv/preview.png">
						<!--=================================================================================== SEO End -->

						<meta name="apple-mobile-web-app-status-bar" content="#2695D4">
						<link rel="apple-touch-icon" href="https://i.postimg.cc/mZJ0wS0v/logo.png">
						<link rel="manifest" href="/manifest.json">
						<script src="/service-register.js"></script>

						<link rel="stylesheet" href="/css/style.css">
						<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
					</head>

					<body>

						<h1>Welcome</span> ${name.split(' ')[0]}!</h1>
						<p>You're just one step away from accessing all the features of Fluxxy. Login to your account to get started.</p>

						<button style="background: var(--accent);" onclick="window.location.href='/login'">Login Now</button>

					</body>

					</html>
				`;

				res.send(userRegisterHtml);
			});
		});
	} else {
		console.error('Password and Confirm Password do not match');
		res.status(500).send(`<script>alert('Password and Confirm Password do not match'); window.history.back();</script>`);
		return;
	}
});
// Register User End


// Login User Start
app.post('/userLogin', (req, res) => {
	const email = req.body.email;
	const password = req.body.password;

	db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
		if (err) {
			console.error(err.message);
			res.status(500).send('Error Fetching Data From Database :(');
			return;
		}

		if (row) {
			if (password === row.password) {
				console.log('Login Successful :)');
				res.cookie('userid', row.id, {
					maxAge: 1000 * 60 * 60 * 24 * 30, // Expires in 30 days
					httpOnly: true, // Only accessible by the server
					secure: false // Only sent over HTTPS
				});
				console.log('User ID Cookie Set Successfully');
				res.cookie('email', email, {
					maxAge: 1000 * 60 * 60 * 24 * 30, // Expires in 30 days
					httpOnly: true, // Only accessible by the server
					secure: false // Only sent over HTTPS
				});
				console.log('Email Cookie Set Successfully');
				res.cookie('name', row.name, { // Save the name of the user from the database
					maxAge: 1000 * 60 * 60 * 24 * 30, // Expires in 30 days
					httpOnly: true, // Only accessible by the server
					secure: false // Only sent over HTTPS
				});
				console.log('Name Cookie Set Successfully');
				res.redirect('/chat');
			} else {
				console.error('Invalid Password :(');
				res.status(500).send(`<script>alert('Invalid Password :('); window.history.back();</script>`);
			}
		} else {
			console.error('Invalid Email :(');
			res.status(500).send(`<script>alert('Invalid Email :('); window.history.back();</script>`);
		}
	});
});
// Login User End


// Loggedin User Info Endpoint Start
app.get('/api/loggedin-userinfo', (req, res) => {
	const userInfo = {
		userid: req.cookies.userid,
		email: req.cookies.email,
		name: req.cookies.name
	};
	res.json(userInfo);
});
// Loggedin User Info Endpoint End

// Logout User Start
app.get('/logout', (req, res) => {
	function removeCookies() {
		res.clearCookie('userid');
		console.log('User ID Cookie Cleared');
		res.clearCookie('email');
		console.log('Email Cookie Cleared');
		res.clearCookie('name');
		console.log('Name Cookie Cleared');
	}
	removeCookies();
	res.redirect('/login');
});
// Logout User End



// Serve the service worker file
app.get('/service-worker.js', (req, res) => {
	res.sendFile(path.resolve(__dirname, 'public', 'service-worker.js'));
});

// Serve the manifest file
app.get('/manifest.json', (req, res) => {
	res.sendFile(path.resolve(__dirname, 'public', 'manifest.json'));
});


app.use((req, res) => {
	res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});


server.listen(port, () => {
	console.log(`Server listening at\n-> http://localhost:${port}\n`);
});