<template>
	<blockquote class="container rounded border py-2" style="background: rgba(0, 0, 0, 0.05)">
		<p class="mb-0">{{ message.content }}</p>
		<footer class="blockquote-footer">Sent by <cite>{{ message.player.nickname }}</cite></footer>
	</blockquote>
</template>

<script>
module.exports = { props: ["message"] };
</script>