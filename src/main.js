import Vue from "vue";
import App from "./App.vue";
import store from "./store/store";
import shortcuts from "./store/shortcuts";

Vue.config.productionTip = true;

new Vue({
  data: store,
  render: h => h(App)
}).$mount("#app");

shortcuts();