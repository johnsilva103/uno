<template>
	<div>
		<h4>Players</h4>
		<ul class="list-group">
			<li class="list-group-item" v-for="(player, i) in players" :key="i" :class="{ active: active === player.id }">
				{{ player.nickname }}
				<small class="text-muted" v-if="player.id === selfID">you</small>
				<div class="float-right">
					<i v-if="direction && active === player.id" class="fa" :class="{ 'fa-arrow-down': direction === 1, 'fa-arrow-up': direction === -1 }" aria-hidden="true"></i>
					<span v-if="player.cardsLeft !== undefined" class="badge badge-info">{{ player.cardsLeft }}</span>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
module.exports = { props: ["selfID", "active", "players", "direction"] };
</script>