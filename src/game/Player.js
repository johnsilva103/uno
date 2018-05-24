const data = require("./data");
const SnowflakeGenerator = require("../SnowflakeGenerator");

class Player {
	constructor(wsClient) {
		this.wsClient = wsClient;
		this.id = SnowflakeGenerator.next();
		this.game = null;
		this.hand = null;
		this.nickname = `User ${this.id}`;

		data.players.set(this.id, this);
	}

	disconnect() {
		if(this.game) this.game.leave(this);

		data.players.delete(this.id);
	}

	setGame(game) {
		this.game = game;
		this.send({ op: "setGame", game });
	}

	send(info) {
		this.wsClient.send(info);
	}

	update() {
		this.send({ op: "selfUpdate", player: this });
	}

	toJSON() {
		return {
			id: this.id,
			nickname: this.nickname
		};
	}
}

module.exports = Player;
