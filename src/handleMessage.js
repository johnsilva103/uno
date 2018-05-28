const data = require("./game/data");
const Game = require("./game/Game");

const handlers = {
	nickname(client, { nickname }) {
		if(typeof nickname !== "string" || nickname.length < 2 || nickname.length > 32) {
			client.send({
				op: "error",
				errorOP: ["nickname", "badNickname"],
				error: "Bad nickname, doesn't meet criteria"
			});
			return;
		}

		if(client.player.game) {
			client.player.game.chat(`${client.player.nickname} changed nickname to ${nickname}`);
		}

		client.player.setNickname(nickname);
	},
	createGame(client, { name, password }) {
		if(client.player.game) {
			client.send({
				op: "error",
				errorOP: ["createGame", "inGame"],
				error: "Can't create a game; already in one"
			});
		} else {
			new Game(client.server, client.player, name, password); // eslint-disable-line no-new
		}
	},
	leave(client) {
		if(!client.player.game) {
			client.send({
				op: "error",
				errorOP: ["leave", "notInGame"],
				error: "Not in a game"
			});
		} else if(client.player.game.host.id === client.player.id) {
			handlers.deleteGame(client);
		} else {
			client.player.game.chat(`${client.player.nickname} left the game`);
			client.player.game.leave(client.player);
		}
	},
	deleteGame(client) {
		if(!client.player.game) {
			client.send({
				op: "error",
				errorOP: ["deleteGame", "notInGame"],
				error: "Not in a game"
			});
		} else if(client.player.game.host.id !== client.player.id) {
			client.send({
				op: "error",
				errorOP: ["deleteGame", "notHost"],
				error: "Cannot delete a game that you are not hosting"
			});
		} else {
			client.player.game.delete();
		}
	},
	getGames(client) {
		client.send({
			op: "gameList",
			games: [...data.games.values()].filter(game => !game.started)
		});
	},
	joinGame(client, { id, password }) {
		if(!id) {
			client.send({
				op: "error",
				errorOP: ["joinGame", "noGameID"],
				error: "No game ID given"
			});

			return;
		}

		const game = data.games.get(id);
		if(!game) {
			client.send({
				op: "error",
				errorOP: ["joinGame", "invalidGameID"],
				error: `Invalid game id: ${id}`
			});
		} else if(!password && game.password) {
			client.send({
				op: "error",
				errorOP: ["joinGame", "noPassword"],
				error: "No password given for a password-protected game"
			});
		} else if(game.password && !game.checkPassword(password)) {
			client.send({
				op: "error",
				errorOP: ["joinGame", "incorrectPassword"],
				error: "Incorrect password"
			});
		} else if(game.players.size >= 10) {
			client.send({
				op: "error",
				errorOP: ["joinGame", "tooManyPlayers"],
				error: "Game already has maximum amount of players (10)"
			});
		} else if(game.started) {
			client.send({
				op: "error",
				errorOP: ["joinGame", "alreadyStarted"],
				error: "Cannot join a game that already started"
			});
		} else {
			game.chat(`${client.player.nickname} joined the lobby`);
			game.join(client.player);
		}
	},
	chat(client, { content }) {
		if(!client.player.game) {
			client.send({
				op: "error",
				errorOP: ["chat", "notInGame"],
				error: "Can't chat; not in any game"
			});
		} else if(!content || !content.trim().length) {
			client.send({
				op: "error",
				errorOP: ["chat", "invalidMessage"],
				error: "Cannot send empty message"
			});
		} else {
			client.player.chat(content);
		}
	},
	start(client) {
		if(!client.player.game) {
			client.send({
				op: "error",
				errorOP: ["start", "notInGame"],
				error: "Not in a game"
			});
		} else if(client.player.game.host.id !== client.player.id) {
			client.send({
				op: "error",
				errorOP: ["start", "notHost"],
				error: "Cannot start a game if not hosting any"
			});
		} else if(client.player.game.started) {
			client.send({
				op: "error",
				errorOP: ["start", "alreadyStarted"],
				error: "Game has already started"
			});
		} else if(client.player.game.players.size < 2) {
			client.send({
				op: "error",
				errorOP: ["start", "notEnoughPlayers"],
				error: "Cannot start a game with less than 2 players"
			});
		} else {
			client.player.game.chat("Game started!");
			client.player.game.start();
		}
	},
	play(client, { card: { category, name } }) {
		if(!client.player.game) {
			client.send({
				op: "error",
				errorOP: ["play", "notInGame"],
				error: "Not in a game"
			});
		} else if(!client.player.game.started) {
			client.send({
				op: "error",
				errorOP: ["play", "notStarted"],
				error: "Game has not started"
			});
		} else if(client.player.game.turn !== client.player.id) {
			client.send({
				op: "error",
				errorOP: ["play", "notYourTurn"],
				error: "Cannot play a card if it's not your turn"
			});
		} else if(!category || !name) {
			client.send({
				op: "error",
				errorOP: ["play", "invalidCard"],
				error: "Both card category and name must be specified"
			});
		} else {
			const card = client.player.hand.findCard(category, name);

			if(!card) {
				client.send({
					op: "error",
					errorOP: ["play", "cardNotFound"],
					error: "Card matching description not found in player's hand"
				});
			} else if(!card.playable) {
				client.send({
					op: "error",
					errorOP: ["play", "notPlayable"],
					error: "Card is not currently playable"
				});
			} else {
				client.player.hand.play(card);
			}
		}
	},
	endTurn(client, { color }) {
		if(!client.player.game) {
			client.send({
				op: "error",
				errorOP: ["endTurn", "notInGame"],
				error: "Not in a game"
			});
		} else if(!client.player.game.started) {
			client.send({
				op: "error",
				errorOP: ["endTurn", "notStarted"],
				error: "Game has not started"
			});
		} else if(client.player.game.turn !== client.player.id) {
			client.send({
				op: "error",
				errorOP: ["endTurn", "notYourTurn"],
				error: "You cannot end a turn if it is not yours!"
			});
		} else if(color) {
			if(client.player.game.face.category !== "other") {
				client.send({
					op: "error",
					errorOP: ["endTurn", "notWildCard"],
					error: "Cannot set color; a wild card was not played"
				});
			} else {
				client.player.game.chat(`${client.player.nickname} selected ${color}`);
				client.player.game.selectedColor = color;
				client.player.game.nextTurn();
			}
		} else if(client.player.game.drawStack) {
			client.player.game.chat(`${client.player.nickname} drew ${client.player.game.drawStack} cards`);
			client.player.game.emptyDrawStack();
		} else {
			client.send({
				op: "error",
				errorOP: ["endTurn", "cantEnd"],
				error: "Cannot end a turn unless a draw stack exists, or a color must be chosen"
			});
		}
	},
	draw(client) {
		if(!client.player.game) {
			client.send({
				op: "error",
				errorOP: ["draw", "notInGame"],
				error: "Not in a game"
			});
		} else if(!client.player.game.started) {
			client.send({
				op: "error",
				errorOP: ["draw", "notStarted"],
				error: "Game has not started"
			});
		} else if(client.player.game.turn !== client.player.id) {
			client.send({
				op: "error",
				errorOP: ["draw", "notYourTurn"],
				error: "You cannot draw if it is not your turn"
			});
		} else if(client.player.hand.cards.some(card => card.playable)) {
			client.send({
				op: "error",
				errorOP: ["draw", "playableCard"],
				error: "You cannot draw unless none of your cards are playable"
			});
		} else {
			client.player.game.chat(`${client.player.nickname} drew a card`);
			client.player.hand.draw();
			client.player.game.nextTurn();
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
				error: "Message not JSON",
				errorOP: "notJSON"
			});

			return;
		}
	}

	if(!handlers[message.op]) {
		client.send({
			op: "error",
			error: `Invalid OP code: ${message.op}`,
			errorOP: "invalidOP"
		});

		return;
	}

	handlers[message.op](client, message);
};
