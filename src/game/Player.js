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

	send(info) {
		this.wsClient.send(info);
	}

	update() {
		this.send({ op: "selfUpdate", player: this });
	}

	toJSON() {
		return {
			id: this.id,
			hand: this.hand,
			nickname: this.nickname
		};
	}
}

module.exports = Player;
