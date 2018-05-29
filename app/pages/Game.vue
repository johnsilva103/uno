<template>
	<div v-if="gameData">
		<game v-if="gameData.started" :gameData="gameData" :self="self" />
		<lobby v-else :gameData="gameData" :self="self" />
	</div>	
</template>

<script>
module.exports = {
	data() {
		return require("../store");
	},
	created() {
		if(!this.gameData.id || this.gameData.id !== this.$route.params.id) {
			this.$router.replace({ name: "home" });
		}
	}
};
</script>
