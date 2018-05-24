const pace = require("pace-progress");
pace.start();

window.ws = require("./ws/index");

const { default: Vue } = require("vue");
const router = require("./router/index")(Vue);
window.app = new Vue({ router }).$mount("#app");
