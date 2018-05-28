<template>
	<div>
		<h1>{{ gameData.name }}</h1>
		<div class="row">
			<div class="col-sm-12 col-md-3">
				<playerlist :players="gameData.players" :self="self" />
				<button class="btn btn-primary float-right mt-2" v-if="!gameData.started && gameData.host.id === self.id" :disabled="gameData.players.length < 2" @click="start">
					Start Game
				</button>
			</div>
			<div class="col-sm-12 col-md-9">
				<chat :chat="gameData.chat"></chat>
			</div>
		</div>
	</div>
</template>

<script>
module.exports = {
	props: ["gameData", "self"],
	methods: {
		start() {
			ws.send({ op: "start" });
		}
	}
};
</script>

