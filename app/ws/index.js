const store = require("../store");
const handlers = {
	selfUpdate({ player }) {
		store.self = {
			id: player.id,
			nickname: player.nickname
		};
	},
	gameUpdate({ game }) {
		if(store.gameData && store.gameData.id === game.id) {
			store.gameData = game;
		} else if(!game.started) {
			const index = store.games.findIndex(({ id }) => id === game.id);
			if(!~index) store.games.push(game);
			else store.games[index] = game;
		}
	},
	deleteGame({ id }) {
		if(store.gameData && store.gameData.id === id) {
			store.gameData = {};

			app.$router.push({ name: "home" });
		} else if(!store.gameData) {
			const index = store.games.findIndex(game => game.id === id);

			if(!~index) return;
			else store.splice(index, 1);
		}
	},
	playStatus({ status }) {
		store.self = Object.assign(store.self, { status });
	},
	handUpdate({ hand }) {
		store.self = Object.assign(store.self, { hand });
	},
	setGame({ game }) {
		store.games = [];
		store.gameData = game;
		app.$router.push({ name: "game", params: { id: game.id } });
	},
	leave({ id }) {
		if(!store.gameData || store.gameData.id !== id) return;
		store.gameData = {};

		app.$router.push({ name: "home" });
	},
	error({ error }) {
		console.error(error);
	}
};

const ws = new WebSocket(process.env.NODE_ENV === "development" ?
	`ws://localhost:3051` :
	`wss://${window.location.host}/ws/`);

const send = ws.send.bind(ws);
ws.send = data => {
	if(ws.readyState === ws.CONNECTING) {
		if(!ws.openBuffer) ws.openBuffer = [data];
		else ws.openBuffer.push(data);

		return;
	} else if(ws.readyState !== ws.OPEN) {
		return;
	}

	send(JSON.stringify(data));
};

ws.onopen = () => {
	if(ws.openBuffer) ws.openBuffer.forEach(ws.send.bind(ws));

	delete ws.openBuffer;
};

ws.onmessage = ({ data: message }) => {
	message = JSON.parse(message);
	handlers[message.op](message);
};

module.exports = ws;
