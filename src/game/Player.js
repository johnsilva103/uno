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

	setNickname(nickname) {
		this.nickname = nickname;
		this.update();
	}

	send(info) {
		this.wsClient.send(info);
	}

	chat(content) {
		this.game.chat(content, this);
	}

	update() {
		this.send({ op: "selfUpdate", player: this });
	}

	toJSON() {
		return {
			id: this.id,
			nickname: this.nickname,
			cardsLeft: this.hand ? this.hand.size : undefined
		};
	}
}

module.exports = Player;
