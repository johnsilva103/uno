<template>
	<div>
		<div class="row">
			<div class="col-sm-12 col-md-3">
				<playerlist :players="gameData.players" :active="gameData.turn" :selfID="self.id" :direction="gameData.direction" />
			</div>
			<div class="col-sm-12 col-md-9">
				<div class="container face" style="height:200px">
					<card v-for="(card, i) in gameData.faceHistory.concat(gameData.face || { category: 'other', name: 'back' })"
						:key="i"
						:card="card"
						:rotation="-20 + ((i % 4) * 10)"
					/>
				</div>
				<div class="container hand mt-5" style="height:250px">
					<card v-for="(card, i) in self.hand"
						:key="i"
						:card="card"
						:playable="card.playable && gameData.turn === self.id"
						@click.native="play(card)"
						:rotation="Math.floor((60 / (self.hand.length - 1)) * i) - 30"
						:left="Math.floor((80 / (self.hand.length - 1)) * i) - 40"
					/>
				</div>
				<div class="container text-center">
					<div class="btn-group" role="group">
						<button type="button" class="btn btn-primary" @click="draw()" :disabled="gameData.drawStack || gameData.turn !== self.id || self.hand.some(card => card.playable)">Draw Card</button>
					</div>
				</div>
				<chat :chat="gameData.chat" />
			</div>
		</div>

		<div class="modal fade" id="chooseColor" tabindex="-1" role="dialog" aria-hidden="true" data-backdrop="static" data-keyboard="false">
			<div class="modal-dialog modal-dialog-centered" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Choose Color</h5>
					</div>
					<div class="modal-body text-center">
						<div class="color-chooser">
							<div class="top">
								<button type="button" title="red" style="background:red;border-top-left-radius:100%" @click="chooseColor('red')"></button>
								<button type="button" title="green" style="background:green;border-top-right-radius:100%" @click="chooseColor('green')"></button>
							</div>
							<div class="bottom">
								<button type="button" title="yellow" style="background:yellow;border-bottom-left-radius:100%" @click="chooseColor('yellow')"></button>
								<button type="button" title="blue" style="background:blue;border-bottom-right-radius:100%" @click="chooseColor('blue')"></button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
module.exports = {
	props: ["gameData", "self"],
	methods: {
		chooseColor(color) {
			ws.send({ op: "endTurn", color });
			$("#chooseColor").modal("hide");
		},
		play(card) {
			if(card.playable) {
				ws.send({
					op: "play",
					card
				});
			}
		},
		draw() {
			ws.send({ op: "draw" });
		}
	},
	watch: {
		"self.playStatus": function(newValue) {
			if(newValue === "PICK") $("#chooseColor").modal("show");
		},
		"gameData.selectedColor": function(color) {
			this.gameData.face.name += `-${color}`;
		},
		"gameData.turn": function(newTurn) {
			if(newTurn !== this.self.id) return;
			if(this.gameData.drawStack && !this.self.hand.some(card => ~card.name.indexOf("draw"))) {
				ws.send({ op: "endTurn" });
			}
		}
	}
};
</script>

<style lang="scss" scoped>
.color-chooser {
  & button {
    outline: none;
    border: none;
    height: 50px;
    width: 50px;
    margin: 1px;
	border: 1px solid black;
    float: left;
    cursor: pointer;
    transition: 0.5s;
    
    &:hover {
      transform: scale(1.2);
    }
  }
  
  .top, .bottom {
    clear: both;
  }
}

.face, .hand {
	position: relative;

	& .uno-card {
		position: absolute;
	}
}

.face .uno-card {
	transform-origin: center;
	left: 50%;
}

.hand .uno-card {
	transition: 0.75s;

	&.playable {
		cursor: pointer;
	}

	&:not(.playable) {
		cursor: not-allowed;
	}

	&:hover {
		margin-top: -75px;
		z-index: 5;
	}
}
</style>
