class Card {
	constructor(game, category, name) {
		this.game = game;

		this.category = category;
		this.name = name.toString();
	}

	get playable() {
		if(!this.game.face) {
			return true;
		} else if(this.game.face.name === this.name) {
			return true;
		} else if(this.game.drawStack) {
			if(this.game.selectedColor && this.game.selectedColor === this.category && ~this.name.indexOf("draw")) {
				return true;
			} else if(this.category === "other" && ~this.name.indexOf("draw")) {
				return true;
			}
		} else if(this.category === "other") {
			return true;
		} else if(this.game.selectedColor && this.category === this.game.selectedColor) {
			return true;
		} else if(this.category === this.game.face.category) {
			return true;
		}

		return false;
	}

	get readableName() {
		return (this.category !== "other" ? `${this.category} ` : "") +
		(~this.name.indexOf("-") ?
			`${this.name.substring(0, this.name.indexOf("-"))} ${this.name.substring(this.name.indexOf("-") + 1)}` :
			this.name.substring(0));
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
				this.game.drawStack += 4;
			}
		}

		this.game.changeFace(this);
		this.game.selectedColor = null;
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

	toJSON() {
		return {
			playable: this.playable,
			category: this.category,
			name: this.name
		};
	}
}

module.exports = Card;
