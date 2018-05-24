<template>
	<div>
		<div class="container-fluid">
			<h5>{{ self.nickname }}</h5>
		</div>
		<div class="row">
			<div class="col-sm-12 col-md-6 col-lg-3">
				<div class="card">
					<div class="card-body">
						<h5 class="card-title">Create Room</h5>
						<p class="card-text">Create a Uno room to play with your friends</p>
						<button type="button" class="float-right" style="font-size:1.75rem"><i class="fa fa-plus-circle" aria-hidden="true"></i></button>
					</div>
				</div>
			</div>
			<div class="col-sm-12 col-md-6 col-lg-3" v-for="(game, i) in games" :key="i">
				<router-link class="card fade-in" style="color:inherit;text-decoration:inherit" :to="{ name: 'game', params: { id: game.id } }">
					<div class="card-body">
						<h5 class="card-title">{{ game.name }}</h5>
						<h6 class="card-subtitle mb-2 text-muted">{{ game.players.length }} / 10 players</h6>
						<p class="card-text">Players: {{ game.players.map(player => player.name).join(", ") }}</p>
						<button type="button" class="float-right" style="font-size:1.75rem"><i class="fa fa-arrow-circle-right" aria-hidden="true"></i></button>
					</div>
				</router-link>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
button {
	outline: none;
	border: none;
	background: transparent;
	cursor: pointer;
}

.card {
	cursor: pointer;
	transition: 0.25s ease-in;

	&:hover {
		opacity: 0.9;
		transform: scale(1.05);
	}
}

@keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}

.fade-in {
	animation: fade-in 1.5s;
}
</style>

<script>
module.exports = {
	data() {
		return require("../store");
	},
	created() {
		if(!localStorage.nickname) localStorage.nickname = prompt("nickname");

		ws.send({ op: "nickname", nickname: localStorage.nickname });
	}
};
</script>
