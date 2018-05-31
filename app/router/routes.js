module.exports = [{
	name: "home",
	path: "/",
	component: require("../pages/Home.vue")
}, {
	name: "game",
	path: "/game/:id",
	component: require("../pages/Game.vue")
}, {
	name: "404",
	path: "/404",
	alias: "*",
	component: require("../pages/404.vue")
}];
