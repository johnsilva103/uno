const Game = require("./game/Game");

const handlers = {
	nickname(client, { nickname }) {
		if(typeof nickname !== "string" || nickname.length < 2 || nickname.length > 16) {
			client.send({ op: "error", error: "Invalid nickname" });
			return;
		}

		client.player.nickname = nickname;
		client.player.update();
	},
	createGame(client, { name, password }) {
		if(client.game) {
			client.send({ op: "error", error: "Can't create a game; already in one" });
			return;
		}

		const game = new Game(client.server, client.player, name, password);
		client.game = game;

		client.send({ op: "setGame", game });
	},
	leave(client) {
		if(client.game.host.id === client.player.id) {
			handlers.deleteGame(client);
			return;
		} else {
			client.send({ op: "leave", id: client.game.id });
		}
	},
	deleteGame(client) {
		if(client.game.host.id !== client.player.id) {
			client.send({ op: "error", error: "Cannot delete a game if not hosting any" });
			return;
		}

		client.game.delete();
	}
};

module.exports = async (client, message) => {
	if(typeof message !== "object") {
		try {
			message = JSON.parse(message);
		} catch(err) {
			client.send({
				op: "error",
				error: "Message not JSON"
			});
		}
	}

	handlers[message.op](client, message);
};
