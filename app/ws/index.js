const store = require("../store");

const errorHandler = {
	joinGame: {
		incorrectPassword() {
			app.$set(store.errors, "incorrectPassword", true);
		}
	}
};

function playSound(file) {
	new Audio(`/static/audio/${file}.mp3`).play();
}

const handlers = {
	selfUpdate({ player }) {
		Object.assign(store.self, player);
	},
	gameUpdate({ game }) {
		if(game.started) {
			if(!store.gameData.started) {
				playSound("deal");
			} else if(store.gameData.drawStack && !game.drawStack) {
				playSound("draw");
			} else if(store.gameData.turn !== game.turn) {
				const played = store.gameData.face.name;
				const prevCount = store.gameData.players.find(player => player.id === store.gameData.turn).cardsLeft;
				const newCount = game.players.find(player => player.id === store.gameData.turn).cardsLeft;

				if(newCount === 1) playSound("uno");
				else if(prevCount + 1 === newCount) playSound("draw");
				else if(~played.indexOf("reverse")) playSound("reverse");
				else if(~played.indexOf("skip")) playSound("skip");
				else playSound("play");
			}
		} else if(store.gameData.started) {
			playSound("win");
		}

		if(store.gameData.id && store.gameData.id === game.id) {
			Object.assign(store.gameData, game);
		} else {
			const index = store.games.findIndex(({ id }) => id === game.id);
			if(game.started) {
				if(~index) store.games.splice(index, 1);
			} else if(!~index) {
				store.games.push(game);
			} else {
				app.$set(store.games, index, game);
			}
		}
	},
	deleteGame({ id }) {
		if(store.gameData.id && store.gameData.id === id) {
			store.gameData.reset();
			store.self.hand = [];

			app.$router.push({ name: "home" });
		} else if(!store.gameData.id) {
			const index = store.games.findIndex(game => game.id === id);

			if(!~index) return;
			else store.games.splice(index, 1);
		}
	},
	playStatus({ status }) {
		store.self.playStatus = status;
	},
	handUpdate({ hand }) {
		store.self.hand.splice(0, store.self.hand.length, ...hand);
		store.self.hand.sort((a, b) => a.category === "other" ?
			1 :
			b.category === "other" ?
				-1 :
				a.category.localeCompare(b.category));
	},
	setGame({ game }) {
		store.games = [];
		Object.assign(store.gameData, game);

		app.$router.push({ name: "game", params: { id: game.id } });
	},
	leave({ id }) {
		if(!store.gameData.id || store.gameData.id !== id) return;
		store.gameData.reset();

		app.$router.push({ name: "home" });
	},
	error(data) {
		if(errorHandler[data.errorOP[0]] && errorHandler[data.errorOP[0]][data.errorOP[1]]) {
			errorHandler[data.errorOP[0]][data.errorOP[1]](data);
		} else {
			console.error(data.error);
		}
	},
	gameList({ games }) {
		store.games.splice(0, store.games.length, ...games);
	},
	chat({ message }) {
		if(store.gameData.id) store.gameData.chat.push(message);
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

ws.onclose = () => window.location.reload();

module.exports = ws;
