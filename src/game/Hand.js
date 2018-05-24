class Hand {
	constructor(game, player) {
		this.game = game;
		this.player = player;

		this.cards = [];
	}

	get size() {
		return this.cards.length;
	}

	empty() {
		this.cards.forEach(card => this.game.deck.discard(card));
	}

	play(card) {
		if(!card.playable) throw new Error("Card not playable");

		this.splice(this.cards.indexOf(card), 1);
		const status = card.play();

		this.player.send({ op: "playStatus", status });
		this.update();
	}

	addCards(cards) {
		this.cards = this.cards.concat(cards);

		this.update();
	}

	draw() {
		this.addCards(this.game.deck.draw());

		this.update();
	}

	update(extra) {
		this.player.send({ op: "handUpdate", hand: this });
	}

	toJSON() {
		return this.cards.map(card => ({
			playable: this.playable,
			category: this.category,
			name: this.name
		}));
	}
}

module.exports = Hand;
