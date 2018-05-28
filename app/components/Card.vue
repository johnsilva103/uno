<template>
	<div class="uno-card" :style="`transform:rotate(${rotation}deg);left:${50 + left}%`" :class="{ playable }">
		<img class="img-responsive" :src="`/static/${card.category}/${selectedColor ? `${card.name}-${selectedColor}` : card.name}.png`" />
	</div>
</template>

<script>
module.exports = { props: ["card", "playable", "selectedColor", "rotation", "left"] };
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

