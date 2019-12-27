import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    storage: {
      corsUrl: 'https://api.codetabs.com/v1/proxy?quest=',
      headers: { "Content-Type": "application/json" }
    }
  },
  mutations: {
    setStorage(state, data) {
      state.storage = data
      window.parent.postMessage({
        pluginMessage: {
          action: 'setStorage',
          data
        }
      }, '*')
    }
  },
  actions: {}
});

export default store
