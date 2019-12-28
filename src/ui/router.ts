import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Help from './views/Help.vue';
import Settings from './views/Settings.vue';

Vue.use(Router);

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '',
      name: 'home',
      component: Home
    },
    {
      path: '/help',
      name: 'help',
      component: Help
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    }
  ]
});
