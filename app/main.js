const pace = require("pace-progress");
pace.start();

window.$ = require("jquery"); // eslint-disable-line id-length
require("bootstrap");
require("popper.js");


const { default: Vue } = require("vue");

window.ws = require("./ws/index");
require("./components/index")(Vue);

window.app = new Vue({ router: require("./router/index")(Vue) }).$mount("#app");
