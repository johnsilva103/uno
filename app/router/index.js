const routes = require("./routes");
const fixRoutes = require("./fixRoutes");
const { default: VueRouter } = require("vue-router");

module.exports = Vue => {
	Vue.use(VueRouter);
	return new VueRouter({
		mode: "history",
		routes: fixRoutes(routes)
	});
};
