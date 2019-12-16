import Vue from 'vue';
import VueReact from 'vue-react';
import GraphiQL from 'graphiql'
/*import VueCodemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'*/
import App from './App.vue';
import router from './router';
import store from './store';

import './graphql';
import './workers';

import './assets/styleguide/main.css'
import 'graphiql/graphiql.css'

Vue.config.productionTip = false;

Vue.use(VueReact)
/*Vue.use(VueCodemirror, {
  events: ['update']
})*/

const anyVue = Vue as any
anyVue.react('GraphiQL', GraphiQL);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
