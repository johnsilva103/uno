class Card {
	constructor(game, category, name) {
		this.game = game;

		this.category = category;
		this.name = name.toString();
	}

	get playable() {
		return this.category === "other" || this.game.face.category === this.category || this.game.face.name === this.name;
	}

	play() {
		switch(this.name) {
			case "draw-2": {
				this.game.drawStack += 2;

				break;
			}

			case "skip": {
				this.game.skip();

				break;
			}

			case "reverse": {
				this.game.reverse();

				break;
			}

			case "draw-4": {
				this.game.drawStack += 2;
			}
		}

		this.game.changeFace(this);
		if(~["skip", "reverse"].indexOf(this.name)) {
			if(this.name === "reverse" && this.game.players.size > 2) this.game.nextTurn();

			return "OK";
		} else if(~["wild", "draw-4"].indexOf(this.name)) {
			return "PICK";
		} else {
			this.game.nextTurn();
			return "OK";
		}
	}
}

module.exports = Card;
