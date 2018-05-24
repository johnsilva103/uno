const crypto = require("crypto");
const data = require("./data");
const Deck = require("./Deck");
const Hand = require("./Hand");
const SnowflakeGenerator = require("../SnowflakeGenerator");

class Game {
	constructor(ws, host, name, password) {
		this.ws = ws;
		this.host = host;
		this.name = name || `${host.nickname}'s Game`;
		this.password = password ? crypto.createHash("sha512").update(password).digest("hex") : null;
		this.id = SnowflakeGenerator.next();
		this.players = new Map();
		this.deck = new Deck(this);
		this.started = false;

		this.direction = 1;
		this.turn = null;
		this.face = null;
		this.drawStack = 0;
		this.color = null;

		data.games.set(this.id, this);
		this.join(this.host);
	}

	checkPassword(guess) {
		return crypto.createHash("sha512").update(guess).digest("hex") === this.password;
	}

	reverse() {
		this.direction *= -1;

		this.update();
	}

	skip() {
		this.nextTurn(2);
	}

	nextTurn(add = 1) {
		const keys = [...this.players.keys()];
		let index = keys.indexOf(this.turn) + (add * this.direction);

		if(index >= keys.length) index -= keys.length;
		this.turn = keys[index];

		this.update();
	}

	start() {
		[...this.players.values()].forEach(player => player.hand = new Hand(this, player));
		this.deck.handout(this.players);

		this.started = true;
		this.turn = this.players.keys().next().value;

		this.update();
	}

	changeFace(card) {
		this.deck.discard(this.face);

		if(card.category !== "other") this.color = card.category;
		this.face = card;

		this.update();
	}

	join(player) {
		this.players.set(player.id, player);

		player.setGame(this);
		this.update();
	}

	leave(player) {
		if(this.started) {
			player.hand.empty();
			delete player.hand;
		}

		delete player.game;
		this.players.delete(player.id);

		this.update();
	}

	delete() {
		data.games.delete(this.id);
		this.ws.broadcast({ op: "deleteGame", id: this.id });
	}

	toJSON() {
		const info = {
			id: this.id,
			started: this.started,
			name: this.name,
			password: !!this.password,
			host: this.host
		};

		if(this.started) {
			info.players = [...this.players.values()].map(player => ({
				id: player.id,
				nickname: player.nickname,
				cardsLeft: player.hand.size
			}));

			info.direction = this.direction;
			info.turn = this.turn;
			info.face = info.face && {
				category: this.face.category,
				name: this.face.name
			};
			info.drawStack = this.drawStack;
			info.category = this.category;
		} else {
			info.players = [...this.players.values()];
		}

		return info;
	}

	update() {
		if(this.started) this.broadcast({ op: "gameUpdate", game: this });
		else this.ws.broadcast({ op: "gameUpdate", game: this });
	}

	broadcast(info) {
		[...this.players.values()].forEach(player => player.send(info));
	}
}

module.exports = Game;
