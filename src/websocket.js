const config = require("../config");
const handleMessage = require("./handleMessage");
const Player = require("./game/Player");
const WebSocket = require("ws");

const server = new WebSocket.Server({ port: config.wsPort });

server.on("connection", client => {
	client.server = server;

	const send = client.send.bind(client);
	client.send = json => {
		if(client.readyState !== WebSocket.OPEN) return;
		send(JSON.stringify(json));
	};

	client.on("message", message => handleMessage(client, message));
	client.on("close", () => {
		if(client.player.game) handleMessage(client, { op: "leave" });
	});

	client.player = new Player(client);
});

server.broadcast = data => server.clients.forEach(client => {
	if(client.readyState === WebSocket.OPEN) client.send(data, true);
});

module.exports = server;
