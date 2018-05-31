const blocks = [{
	name: "chat",
	file: "Chat"
}, {
	name: "message",
	file: "Message"
}, {
	name: "lobby",
	file: "Lobby"
}, {
	name: "game",
	file: "Game"
}, {
	name: "playerlist",
	file: "PlayerList"
}, {
	name: "card",
	file: "Card"
}, {
	name: "modal",
	file: "Modal"
}, {
	name: "navbar",
	file: "Navbar"
}, {
	name: "page",
	file: "Page"
}];

module.exports = Vue => {
	blocks.forEach(({ name, file }) => Vue.component(name, require(`./${file}.vue`).default));
};
