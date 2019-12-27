<template>
  <main class="p-4">
    <div class="flex items-center mb-2">
      <router-link
        to="/"
        class="p-2 leading-none font-semibold bg-gray-200 hover:bg-gray-300 rounded hover:text-blue-800 text-gray-800"
        >◂ Back
      </router-link>
      <h2 class="font-semibold text-2xl flex-1 text-center px-4">Settings</h2>
    </div>

    <div class="bg-gray-400 rounded p-2 mb-3">
      <div class="mb-3">
        <p class="font-semibold mb-1">Headers</p>
        <Tooltip
          class="w-full"
          tip="<b>Headers</b><br>Include credentials such as an Authorization header"
        >
          <textarea
            class="w-full textarea"
            v-model="headers"
            placeholder="Enter headers that should be set"
          />
        </Tooltip>
      </div>
      <div class="mb-3">
        <p class="font-semibold mb-1">CORS Image proxy</p>
        <Tooltip
          class="w-full"
          tip="<b>CORS Image proxy</b><br>Set a CORS proxy to be able to access servers behind a strict CORS policy."
        >
          <input
            class="input"
            type="text"
            v-model="corsUrl"
            placeholder="https://example.com/?"
          />
        </Tooltip>
      </div>
    </div>
  </main>
</template>
<script>
import storage from '../storage';
import Tooltip from '../components/Tooltip';

export default {
  components: {
    Tooltip
  },
  data() {
    return {
      headers: '{}',
      corsUrl: ''
    };
  },
  watch: {
    corsUrl(value) {
      storage.setItem('corsUrl', this.corsUrl);
    },
    headers(value) {
      storage.setItem('headers', this.headers);
    }
  },
  mounted() {
    storage.onLoad(() => {
      this.corsUrl = this.$store.state.storage.corsUrl || '';
      this.headers = this.$store.state.storage.headers || '';
    });
    window.parent.postMessage(
      {
        pluginMessage: {
          action: 'getStorage'
        }
      },
      '*'
    );
  }
};
</script>
