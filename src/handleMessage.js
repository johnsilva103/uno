const data = require("./game/data");
const Game = require("./game/Game");

const handlers = {
	nickname(client, { nickname }) {
		if(typeof nickname !== "string" || nickname.length < 2 || nickname.length > 32) {
			client.send({ op: "error", error: "Invalid nickname" });
			return;
		}

		client.player.nickname = nickname;
		client.player.update();
	},
	createGame(client, { name, password }) {
		if(client.player.game) {
			client.send({ op: "error", error: "Can't create a game; already in one" });
			return;
		}

		new Game(client.server, client.player, name, password); // eslint-disable-line no-new
	},
	leave(client) {
		if(client.player.game.host.id === client.player.id) handlers.deleteGame(client);
		else client.send({ op: "leave", id: client.player.game.id });
	},
	deleteGame(client) {
		if(client.player.game.host.id !== client.player.id) {
			client.send({ op: "error", error: "Cannot delete a game if not hosting any" });
		} else {
			client.player.game.delete();
		}
	},
	getGames(client) {
		return client.send({
			op: "gameList",
			games: [...data.games.values()].filter(game => !game.started)
		});
	},
	joinGame(client, { id, password }) {
		const game = data.games.get(id);
		if(!game) {
			client.send({ op: "error", error: `Invalid game id: ${id}` });
		} else if(!password && game.password) {
			client.send({ op: "error", error: "No password given for a password-protected game" });
		} else if(game.password && !game.checkPassword(password)) {
			client.send({ op: "wrongPassword" });
		} else {
			game.join(client.player);
		}
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
