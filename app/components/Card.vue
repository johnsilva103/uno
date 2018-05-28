<template>
	<div class="uno-card" :style="`transform:rotate(${rotation}deg);left:${50 + left}%`" :class="{ playable }">
		<img class="img-responsive" :src="`/static/${card.category}/${card.name}.png`" />
	</div>
</template>

<script>
module.exports = { props: ["card", "playable", "rotation", "left"] };
</script>

<style lang="scss" scoped>
.uno-card {
	margin-left: -75px;
	transform-origin: top;
}

.uno-card img {
	width: 125px;
}
</style>

