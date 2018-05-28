<template>
	<div class="jumbotron jumbotron-fluid rounded px-0 py-3 mt-3">
		<div class="container">
			 <h4>Live Chat</h4>
		</div>
		<div class="container chat-container" :style="`height:${height || 300}px`">
			<message v-for="(message, i) in chat" :key="i" :message="message" />
		</div>
		<div class="container">
			<textarea class="form-control" placeholder="Message" style="resize:none" @keyup.stop.enter="send($event)"></textarea>
		</div>
	</div>
</template>

<script>
module.exports = {
	props: ["chat", "height"],
	created() {
		const [container] = $(".chat-container").get();
		this.$nextTick(() => container.scrollTop = container.scrollHeight);
	},
	watch: {
		chat() {
			const [container] = $(".chat-container").get();
			if(container.scrollTop + container.clientHeight === container.scrollHeight) {
				this.$nextTick(() => container.scrollTop = container.scrollHeight);
			}
		}
	},
	methods: {
		send(event) {
			if(event.shiftKey) return;

			const target = $(event.target);
			ws.send({ op: "chat", content: target.val() });
			target.val("");
		}
	}
};
</script>

<style lang="scss" scoped>
.chat-container {
	overflow-y: auto;
}
</style>
