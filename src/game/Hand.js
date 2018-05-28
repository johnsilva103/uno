class Hand {
	constructor(game, player) {
		this.game = game;
		this.player = player;

		this.cards = [];
	}

	get size() {
		return this.cards.length;
	}

	findCard(category, name) {
		return this.cards.find(card => card.category === category && card.name === name);
	}

	empty() {
		this.cards.forEach(card => this.game.deck.discard(card));
	}

	play(card) {
		if(!card.playable) throw new Error("Card not playable");

		this.cards.splice(this.cards.indexOf(card), 1);
		const status = card.play();
		if(status !== "PICK") this.game.selectedColor = null;

		this.player.send({ op: "playStatus", status });
		this.update();
	}

	addCards(cards) {
		this.cards = this.cards.concat(cards);

		this.update();
	}

	draw(count) {
		this.addCards(this.game.deck.draw(count));
	}

	update(extra) {
		this.player.send({ op: "handUpdate", hand: this });
	}

	toJSON() {
		return this.cards;
	}
}

module.exports = Hand;
