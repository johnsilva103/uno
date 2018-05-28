<template>
	<div class="jumbotron jumbotron-fluid rounded px-0 py-3 mt-3">
		<div class="container">
			<button class="btn float-right" type="button" @click="toggleSound()">
				<i class="fa float-right"
				:class="{
					'fa-volume-up': messageSound,
					'fa-volume-off': !messageSound
				}"
				aria-hidden="true"></i>
			</button>
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
	data() {
		return { messageSound: !!localStorage.messageSound };
	},
	created() {
		this.$nextTick(() => {
			const [container] = $(".chat-container").get();
			container.scrollTop = container.scrollHeight;
		});
	},
	watch: {
		chat() {
			if(this.messageSound) new Audio("/static/audio/message.mp3").play();

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
			if(!target.val().trim()) return;

			ws.send({ op: "chat", content: target.val() });
			target.val("");
		},
		toggleSound() {
			this.messageSound = !this.messageSound;
			localStorage.messageSound = this.messageSound;
		}
	}
};
</script>

<style lang="scss" scoped>
.chat-container {
	overflow-y: auto;
}
</style>
