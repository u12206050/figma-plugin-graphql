<template>
  <p v-if="loading" class="p-4 bg-purple-200">Loading...</p>
  <div class="h-screen" v-else>
    <form
      @submit.stop.prevent="submit"
      class="content flex flex-col mx-auto p-4 pb-8 h-full m-0"
    >
      <div class="bg-gray-400 rounded p-2 mb-4">
        <div class="flex items-center mb-2">
          <div class="input-icon mr-1">
            <div class="input-icon__icon z-10">
              <Tooltip
                tip="<b class='w-56'>Load Schema</b><br>Reconnect and load the schema"
              >
                <button
                  @click.prevent="createFetcher"
                  title=""
                  class="cursor-pointer icon icon--reset-instance icon--button"
                ></button>
              </Tooltip>
            </div>
            <Tooltip
              class="w-full"
              tip="<b>Graphql Server url</b><br><span class='text-orange-500'>CORS info: Check Access-Control-Allow-Origin to allow <b>figma.com</b></span>"
            >
              <input
                class="input-icon__input"
                type="text"
                v-model="url"
                placeholder="https://example.com/graphql"
              />
            </Tooltip>
          </div>
          <router-link
            to="help"
            class="text-purple-600 hover:text-purple-800 px-1"
          >
            <HelpCircle class="stroke-current w-6 h-6" />
          </router-link>
          <router-link
            to="settings"
            class="text-purple-600 hover:text-purple-800 px-1"
          >
            <Settings class="stroke-current w-6 h-6" />
          </router-link>
        </div>
        <div class="flex items-center">
          <Tooltip
            class="w-full"
            tip="Specifying this will duplicate your selected component for each item in the array before populating in the fields"
          >
            <input
              class="input"
              type="text"
              v-model="key"
              placeholder="Path to iterate over, eg. data.allPosts"
            />
          </Tooltip>
          <button
            aria-description="Generate elements with filled data"
            :class="[
              !fetcher
                ? 'cursor-not-allowed text-gray-400'
                : 'hover:text-blue-800 text-gray-800'
            ]"
            class="ml-2 p-2 leading-none font-semibold bg-gray-200 hover:bg-gray-300 rounded"
          >
            Generate
          </button>
        </div>
      </div>
      <div v-if="fetcher" class="relative flex-1 h-56">
        <GraphiQL
          key="graphiql"
          :fetcher="fetcher"
          :storage="storage"
          ref="graphiql"
        ></GraphiQL>
      </div>
      <p v-else class="block p-2 bg-gray-100 text-gray-900 rounded">
        Please enter your graphql url and click the "Load Schema" button to the
        left
      </p>
    </form>
  </div>
</template>

<script>
import { introspectionQuery, buildSchema, printSchema, buildClientSchema, validateSchema } from 'graphql'
import storage from '../storage'
import sdlSchema from 'raw-loader!../gql/schema.gql'
import Tooltip from '../components/Tooltip'
import Settings from "../assets/icons/settings.svg"
import HelpCircle from "../assets/icons/help-circle.svg"

const schema = null

export default {
  data() {
    return {
      loading: true,
      storage,
      fetcher: null,
      key: '',
      url: '',
      tab: 1,
      variables: `{}`,
      headers: '{ "Content-Type": "application/json" }',
      jsonOpts: {
        mode: 'application/json',
        tabSize: 2,
        lineNumbers: true
      }
    };
  },
  methods: {
    createFetcher() {
      const endpoint = this.url
      if (this.headers) storage.setItem('headers', this.headers);
      if (endpoint) {
        storage.setItem('url', endpoint);
        const parsedHeaders = JSON.parse(this.headers);
        const options = { method: 'post', headers: parsedHeaders };
        this.fetcher = param =>
          fetch(endpoint, { ...options, body: JSON.stringify(param) }).then(
            response => response.json()
          );
      } else {
        this.fetcher = null;
      }
    },
    chooseEndpoint() {
      window.prompt('Choose the new endpoint', (val) => {
        this.url = val
      })
    },
    submit() {
      if (!this.fetcher) this.createFetcher()
      if (!this.fetcher) return
      const graphiql = this.$refs.graphiql.component
      try {
        const res = JSON.parse(graphiql.state.response)
        if (res.data) {
          parent.postMessage({ pluginMessage: {
            action: 'generate',
            data: res.data,
            key: this.key.replace(/^data./,'')
          } }, '*')
        }
      } catch (err) {
        console.warn(err)
      }
    }
  },
  mounted() {
    storage.onLoad(() => {
      this.headers = this.$store.state.storage.headers || ''
      if (this.url = this.$store.state.storage.url || '')
        this.createFetcher()
      this.loading = false
    })
    window.parent.postMessage({
      pluginMessage: {
        action: 'getStorage'
      }
    }, '*')
    this.loading = window.self !== window.top
  },
  components: {
    Tooltip,
    Settings,
    HelpCircle
  }
}
</script>

<style lang="scss">
* {
  &::selection {
    color: #fff !important;
    background: black !important;
  }
}
.graphiql-container {
  border-radius: 8px;
  border: 1px solid #d4d4d4;
  .result-window .CodeMirror {
    background: #0e1f2c;
  }
  .doc-explorer-title { line-height: 0; }
  .topBarWrap .topBar {
    padding: 6px 12px;
    height: auto;
  }
  .CodeMirror {
    background: #0e1f2c;
    .CodeMirror-selected {
      background: #04101a;
    }
    .CodeMirror-focused .CodeMirror-selected {
      background: #0d3252;
    }
    .CodeMirror-lines {
      background: #0e1f2c;
      color: #23a166;


      .cm-comment { color: #428BDD; }
      .cm-atom { color: #AE81FF; }
      .cm-number { color: #D1EDFF; }

      .cm-property { color: #00bd65; }
      .cm-attribute { color: rgb(247, 116, 102); }
      .cm-keyword { color: #E83737; }
      .cm-string { color: #1DC116; }

      .cm-variable { color: #FFAA3E; }
      .cm-variable-2 { color: #FFAA3E; }
      .cm-def { color: #4DD; }
      .cm-bracket { color: #D1EDFF; }
      .cm-tag { color: #449; }
      .cm-link { color: #AE81FF; }
      .cm-error { background: #F92672; color: #F8F8F0; }
    }

    .CodeMirror-activeline-background { background: #253540; }

    &-selected { background: #314D67; }
    .CodeMirror-line::selection, .CodeMirror-line > span::selection, .CodeMirror-line > span > span::selection { background: rgba(49, 77, 103, .99); }
    .CodeMirror-line::-moz-selection, .CodeMirror-line > span::-moz-selection, .CodeMirror-line > span > span::-moz-selection { background: rgba(49, 77, 103, .99); }
    .CodeMirror-gutters { background: #0F192A; border-right: 1px solid; width: 41px; }
    .CodeMirror-guttermarker { color: white; }
    .CodeMirror-guttermarker-subtle { color: #d0d0d0; }
    .CodeMirror-linenumber { color: #D0D0D0; }
    .CodeMirror-cursor { border-left: 1px solid #d4d4d4; }
    .CodeMirror-matchingbracket {
      text-decoration: underline;
      color: #d0d0d0 !important;
    }
  }
}
</style>