const pace = require("pace-progress");
pace.start();

const { default: Vue } = require("vue");

window.ws = require("./ws/index");
require("./components/index")(Vue);

window.app = new Vue({ router: require("./router/index")(Vue) }).$mount("#app");
