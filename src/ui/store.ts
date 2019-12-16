import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    storage: {}
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
