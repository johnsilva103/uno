<template>
	<div>
		<div class="container-fluid py-2 bg-white rounded">
			<div class="btn-group float-right" role="group">
				<button class="btn" v-if="$route.name !== 'home'" @click="leave()">
					<i class="fa fa-sign-out" aria-hidden="true"></i>
				</button>
				<button class="btn" @click="$refs.nicknameModal.show()">
					<i class="fa fa-pencil" aria-hidden="true"></i>
				</button>
			</div>

			<h5>{{ self.nickname }}</h5>
		</div>

		<modal ref="nicknameModal">
			<template slot="header">Nickname</template>

			<div class="form-group">
				<input type="text" class="form-control" placeholder="John Appleseed" v-model.trim="nickname" autofocus />
				<small class="form-text text-danger" v-if="!nickname || nickname.length < 2 || nickname.length > 32">Must be between 2 characters and 32 characters long</small>
			</div>

			<button slot="footer" type="button" class="btn btn-success" data-dismiss @click="updateNickname()" :disabled="!nickname || nickname.length < 2 || nickname.length > 32">Done</button>
		</modal>
	</div>
</template>

<script>
module.exports = {
	data() {
		return Object.assign({ nickname: localStorage.nickname }, require("../store"));
	},
	async created() {
		if(localStorage.nickname) {
			this.updateNickname();
		} else {
			await this.$nextTick();
			this.$refs.setNickname.show();
		}
	},
	methods: {
		leave() {
			ws.send({ op: "leave" });
			this.$router.push({ name: "home" });
		},
		updateNickname() {
			if(!this.nickname) return;

			localStorage.nickname = this.nickname;
			ws.send({ op: "nickname", nickname: this.nickname });
		}
	}
};
</script>
