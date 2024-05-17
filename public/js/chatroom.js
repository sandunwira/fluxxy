const socket = io();

const chatroom = document.getElementById('chatroom');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const onlineUsers = document.getElementById('onlineUsers');

messageInput.focus();

// Listen for chat message events from the server
socket.on('chatMessage', (msg) => {
	const div = document.createElement('div');

	// Check if the message is from the current user
	if (msg.userId === socket.id) {
		div.classList.add('my-msg');
	} else {
		div.classList.add('other-msg');
	}

	// Create a new span element for the message wrapper
	const msgWrapper = document.createElement('span');
	msgWrapper.classList.add('msg-wrapper');

	// Create a new span element for the message content
	const msgContent = document.createElement('span');
	const textWithLinks = msg.text.replace(/\b((https?:\/\/\S+)|(www\.\S+)|(\w+\.\w+))\b/g, (match) => {
		const url = match.startsWith('http') ? match : `https://${match}`;
		return `<a href="${url}" target="_blank">${match}</a>`;
	});
	msgContent.innerHTML = textWithLinks;
	msgContent.classList.add('msg-content');

	// Create a new span element for the timestamp
	const timestamp = document.createElement('span');
	timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
	timestamp.classList.add('timestamp');

	// Append the message content and timestamp to the message wrapper
	msgWrapper.appendChild(msgContent);
	msgWrapper.appendChild(timestamp);

	// Append the message wrapper to the message div
	div.appendChild(msgWrapper);

	chatroom.appendChild(div);

	// Scroll to the bottom of the chat room
	chatroom.scrollTop = chatroom.scrollHeight;
});


// Listen for onlineCount events from the server
socket.on('onlineCount', (count) => {
	if (count <= 1) {
		onlineUsers.textContent = `You are online`;
	} else {
		onlineUsers.textContent = `${count} users are online`;
	}
});


// Emit chat message events to the server
messageForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const msg = messageInput.value;
	// Include the user ID with the message
	socket.emit('chatMessage', { text: msg, userId: socket.id });
	messageInput.value = '';
});