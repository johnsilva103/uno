module.exports = {
	games: [],
	self: {
		id: null,
		nickname: localStorage.nickname,
		playStatus: null,
		hand: []
	},
	gameData: {},
	errors: {}
};

function resetGameData() {
	module.exports.gameData = {
		chat: [],
		faceHistory: [],
		host: {
			id: null,
			nickname: null
		},
		id: null,
		name: null,
		password: null,
		players: [],
		started: null,
		direction: null,
		drawStack: null,
		face: null,
		turn: null,
		selectedColor: null
	};

	module.exports.gameData.reset = resetGameData;
}

resetGameData();
