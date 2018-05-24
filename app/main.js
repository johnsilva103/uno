const pace = require("pace-progress");
pace.start();

window.$ = require("jquery"); // eslint-disable-line id-length
require("bootstrap");
require("popper.js");
window.ws = require("./ws/index");

const { default: Vue } = require("vue");
const router = require("./router/index")(Vue);
window.app = new Vue({ router }).$mount("#app");
