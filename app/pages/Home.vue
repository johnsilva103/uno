<template>
	<div>
		<div class="container-fluid">
			<h5>{{ self.nickname }}</h5>
		</div>
		<div class="row">
			<div class="col-sm-12 col-md-6 col-lg-3">
				<div class="card" data-toggle="modal" data-target="#createGame">
					<div class="card-body">
						<h5 class="card-title">Create Room</h5>
						<p class="card-text">Create a Uno room to play with your friends</p>
						<i class="fa fa-plus-circle float-right" aria-hidden="true" style="font-size:1.75rem"></i>
					</div>
				</div>
			</div>
			<div class="col-sm-12 col-md-6 col-lg-3" v-for="(game, i) in games" :key="i">
				<transition name="fade">
					<div class="card" style="color:inherit;text-decoration:inherit" @click="joinGame(game)">
						<div class="card-body">
							<h5 class="card-title">
								{{ game.name }}
								<i class="fa fa-lock float-right" aria-hidden="true" style="font-size:1.75rem" v-if="game.password"></i>
							</h5>
							<h6 class="card-subtitle mb-2 text-muted">{{ game.players.length }} / 10 players</h6>
							<p class="card-text">Players: {{ game.players.map(player => player.nickname).join(", ") }}</p>
							<i class="fa fa-arrow-circle-right float-right" aria-hidden="true" style="font-size:1.75rem"></i>
						</div>
					</div>
				</transition>
			</div>
		</div>

		<div class="modal fade" id="setNickname" tabindex="-1" role="dialog" aria-hidden="true">
			<div class="modal-dialog modal-dialog-centered" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Nickname</h5>
						<button type="button" class="close" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div class="modal-body">
						<div class="form-group">
							<input type="text" class="form-control" placeholder="John Appleseed" v-model.trim="nickname" />
							<small class="form-text text-danger" v-if="!nickname || nickname.length < 2 || nickname.length > 32">Must be between 2 characters and 32 characters long</small>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-success" data-dismiss="modal" @click="updateNickname()" :disabled="nickname && (nickname.length < 2 || nickname.length > 32)">Done</button>
					</div>
				</div>
			</div>
		</div>

		<div class="modal fade" id="gamePassword" tabindex="-1" role="dialog" aria-hidden="true">
			<div class="modal-dialog modal-dialog-centered" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Game Password</h5>
						<button type="button" class="close" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div class="modal-body">
						<div class="form-group">
							<input type="password" class="form-control" v-model.trim="password.value" />
							<small class="form-text text-danger" v-if="errors.incorrectPassword">Incorrect Password</small>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-success" @click="joinGame()" :disabled="!password.value">Join</button>
					</div>
				</div>
			</div>
		</div>

		<div class="modal fade" id="createGame" tabindex="-1" role="dialog" aria-hidden="true">
			<div class="modal-dialog modal-dialog-centered" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title">Create Game</h5>
						<button type="button" class="close" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div class="modal-body">
						<div class="form-group">
							<label for="name">Name</label>
							<input type="text" class="form-control" id="name" v-model.trim="gameOptions.name" />
							<small class="form-text text-danger" v-if="gameOptions.name > 32">Game name cannot be longer than 32 characters</small>
						</div>
						<div class="form-group">
							<label for="password">Password (optional)</label>
							<input type="text" class="form-control" id="password" v-model.trim="gameOptions.password" autocomplete="off" />
							<small class="form-text text-danger" v-if="gameOptions.password > 32">Game password cannot be longer than 32 characters</small>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-primary" data-dismiss="modal" @click="createGame()">Create</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.card {
	cursor: pointer;
	transition: 0.25s ease-in;

	&:hover {
		opacity: 0.9;
		transform: scale(1.05);
	}
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>

<script>
module.exports = {
	data() {
		return Object.assign({
			gameOptions: {},
			nickname: localStorage.nickname,
			password: {}
		}, require("../store"));
	},
	created() {
		if(localStorage.nickname) this.updateNickname();
		else this.$nextTick(() => $("#setNickname").modal("show"));

		ws.send({ op: "getGames" });
	},
	methods: {
		updateNickname() {
			if(!this.nickname) return;

			localStorage.nickname = this.nickname;
			this.gameOptions.name = `${this.nickname}'s game`;
			ws.send({ op: "nickname", nickname: this.nickname });
		},
		createGame() {
			ws.send({ op: "createGame", name: this.gameOptions.name, password: this.gameOptions.password });
		},
		joinGame(game) {
			if(!game) game = this.password.game;

			if(game.password && (!this.password.game || this.password.game.id !== game.id)) {
				this.password = {
					value: "",
					incorret: false,
					game
				};
			} else if(game.password && !$("#gamePassword").hasClass("show")) {
				$("#gamePassword").modal("show");
			} else {
				ws.send({ op: "joinGame", id: game.id, password: this.password && this.password.value });
			}
		}
	}
};
</script>
