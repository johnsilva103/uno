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
		this.selectedColor = null;
		this.direction = 1;
		this.turn = null;
		this.face = null;
		this.drawStack = 0;
		this.faceHistory = [];

		data.games.set(this.id, this);
		this.join(this.host);
	}

	finish() {
		this.deck.reset();
		[...this.players.values()].forEach(player => player.hand = null);

		this.started = false;
		this.selectedColor = null;
		this.direction = 1;
		this.turn = null;
		this.face = null;
		this.drawStack = 0;
		this.faceHistory = [];

		this.update();
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

	async nextTurn(add = 1) {
		if(
			this.players.has(this.turn) &&
			this.players.get(this.turn).hand &&
			this.players.get(this.turn).hand.size === 0
		) {
			this.chat(`${this.players.get(this.turn).nickname} won the game!`);
			this.finish();
			return;
		}

		const keys = [...this.players.keys()];
		let index = keys.indexOf(this.turn) + (add * this.direction);

		if(index >= keys.length) index -= keys.length;
		else if(index < 0) index += keys.length;
		this.turn = keys[index];

		await new Promise(resolve => process.nextTick(resolve));
		this.players.get(this.turn).hand.update();
		await new Promise(resolve => process.nextTick(resolve));
		this.update();
	}

	start() {
		[...this.players.values()].forEach(player => player.hand = new Hand(this, player));
		this.deck.handout(this.players);

		this.started = true;
		this.turn = this.players.keys().next().value;

		this.ws.broadcast({
			op: "gameUpdate",
			game: this
		});
	}

	changeFace(card) {
		this.deck.discard(this.face);

		if(this.face) this.faceHistory.push(this.face);
		this.face = card;

		this.update();
	}

	join(player) {
		this.players.set(player.id, player);

		player.setGame(this);
		this.update();
	}

	leave(player) {
		player.game = null;
		this.players.delete(player.id);

		if(this.started) {
			player.hand.empty();
			player.hand = null;

			if(this.turn === player.id) this.nextTurn();
			if(this.players.size === 1) {
				this.chat("Game ended. Requires 2+ players.");
				this.finish();
				return;
			}
		}


		player.send({
			op: "leave",
			id: this.id
		});

		this.update();
	}

	delete() {
		data.games.delete(this.id);
		[...this.players.values()].forEach(player => {
			player.game = null;
			player.hand = null;
		});

		this.ws.broadcast({ op: "deleteGame", id: this.id });
	}

	emptyDrawStack() {
		this.players.get(this.turn).hand.draw(this.drawStack);
		this.drawStack = 0;

		this.nextTurn();
	}

	chat(content, player = "system") {
		this.broadcast({ op: "chat", message: { content, player } });
	}

	toJSON() {
		const info = {
			players: [...this.players.values()],
			id: this.id,
			started: this.started,
			name: this.name,
			password: !!this.password,
			host: this.host
		};

		if(this.started) {
			info.selectedColor = this.selectedColor;
			info.direction = this.direction;
			info.turn = this.turn;
			info.face = this.face;
			info.drawStack = this.drawStack;
			info.category = this.category;
			info.faceHistory = this.faceHistory;
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
