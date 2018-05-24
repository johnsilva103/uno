const Card = require("./Card");

const deck = {
	blue: {
		1: [0],
		2: [1, 2, 3, 4, 5, 6, 7, 8, 9, "draw-2", "reverse", "skip"]
	},
	green: {
		1: [0],
		2: [1, 2, 3, 4, 5, 6, 7, 8, 9, "draw-2", "reverse", "skip"]
	},
	red: {
		1: [0],
		2: [1, 2, 3, 4, 5, 6, 7, 8, 9, "draw-2", "reverse", "skip"]
	},
	yellow: {
		1: [0],
		2: [1, 2, 3, 4, 5, 6, 7, 8, 9, "draw-2", "reverse", "skip"]
	},
	other: { 4: ["draw-4", "wild"] }
};

class Deck {
	constructor(game) {
		this.game = game;

		this.discardPile = [];
		this.cards = Object.entries(deck).reduce((cards, [category, value]) => {
			Object.entries(value).forEach(([times, cardList]) => {
				for(let i = 0; i < times; i++) {
					cardList.forEach(card => cards.push(new Card(this.game, category, card)));
				}
			});

			return cards;
		}, []);

		this.shuffle();
	}

	refreshCards() {
		this.cards = this.cards.concat(this.discardPile);
		this.shuffle();
	}

	discard(card) {
		this.discardPile.push(card);
	}

	shuffle() {
		for(let i = this.cards.length - 1; i > 0; i--) {
			const swapWith = Math.floor(Math.random() * (i + 1));
			[this.cards[i], this.cards[swapWith]] = [this.cards[swapWith], this.cards[i]];
		}
	}

	handout(players) {
		[...players.values()]
			.forEach(player => player.hand.addCards(this.draw(7)));
	}

	draw(count = 1) {
		if(count > this.cards.length) this.refreshCards();
		const drawn = this.cards.splice(0, count);

		if(drawn.length === 1) return drawn[0];
		else return drawn;
	}
}

module.exports = Deck;
