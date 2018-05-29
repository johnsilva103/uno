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
		<div class="container" id="chat-container" :style="`height:${height || 300}px`">
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
	async mounted() {
		await this.$nextTick();

		const container = document.querySelector("#chat-container");
		if(!container) return;
		else container.scrollTop = container.scrollHeight;
	},
	watch: {
		async chat() {
			if(this.messageSound) {
				const sound = new Audio("/static/audio/message.mp3");
				sound.volume = 0.25;
				sound.play();
			}

			const container = document.querySelector("#chat-container");
			if(container.scrollTop + container.clientHeight === container.scrollHeight) {
				await this.$nextTick();
				container.scrollTop = container.scrollHeight;
			}
		}
	},
	methods: {
		send(event) {
			if(event.shiftKey) return;

			if(!event.target.value.trim()) return;
			ws.send({ op: "chat", content: event.target.value.trim() });
			event.target.value = "";
		},
		toggleSound() {
			this.messageSound = !this.messageSound;
			localStorage.messageSound = this.messageSound;
		}
	}
};
</script>

<style lang="scss" scoped>
#chat-container {
	overflow-y: auto;
}
</style>
