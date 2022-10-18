import { createApp } from "vue";
import IFCPlayground from "./IFCPlayground.vue";
import BootstrapVue3 from 'bootstrap-vue-3'
import VNetworkGraph from "v-network-graph"
import "v-network-graph/lib/style.css"
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'
import '@sweetalert2/theme-borderless/borderless.scss';

var app = createApp(IFCPlayground);
app.use(BootstrapVue3)
app.use(VNetworkGraph)
app.mount("#app");