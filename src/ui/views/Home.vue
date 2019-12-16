<template>
  <p v-if="loading" class="p-4 bg-purple-200">Loading...</p>
  <div class="h-screen" v-else>
    <form @submit.stop.prevent="submit" class="content flex flex-col mx-auto p-4 pb-8 h-full m-0">
      <div class="bg-gray-400 rounded p-2 mb-4 flex items-center">
        <div class="input-icon">
          <div class="input-icon__icon z-10">
            <Tooltip tip="<b class='w-56'>Load Schema</b><br>Reconnect and load the schema">
              <button @click.prevent="createFetcher" title=""  class="cursor-pointer icon icon--reset-instance icon--button"></button>
            </Tooltip>
          </div>
          <Tooltip class="w-full" tip="<b>Graphql Server url</b><br><span class='text-orange-500'>CORS info: Check Access-Control-Allow-Origin to allow <b>figma.com</b></span>">
            <input
              class="input-icon__input"
              type="text" v-model="url" placeholder="https://example.com/graphql" />
          </Tooltip>
        </div>
        <router-link to="help" class="text-purple-600 hover:text-purple-800 px-2">
          <svg class="fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 431.855 431.855" xml:space="preserve"><g><path d="M215.936,0C96.722,0,0.008,96.592,0.008,215.814c0,119.336,96.714,216.041,215.927,216.041c119.279,0,215.911-96.706,215.911-216.041C431.847,96.592,335.214,0,215.936,0z M231.323,335.962c-5.015,4.463-10.827,6.706-17.411,6.706c-6.812,0-12.754-2.203-17.826-6.617c-5.08-4.406-7.625-10.575-7.625-18.501c0-7.031,2.463-12.949,7.373-17.745c4.91-4.796,10.933-7.194,18.078-7.194c7.031,0,12.949,2.398,17.753,7.194c4.796,4.796,7.202,10.713,7.202,17.745C238.858,325.362,236.346,331.5,231.323,335.962z M293.856,180.934c-3.853,7.145-8.429,13.306-13.737,18.501c-5.292,5.194-14.81,13.924-28.548,26.198c-3.788,3.463-6.836,6.503-9.12,9.12c-2.284,2.626-3.991,5.023-5.105,7.202c-1.122,2.178-1.983,4.357-2.593,6.535c-0.61,2.17-1.528,5.999-2.772,11.469c-2.113,11.608-8.754,17.411-19.915,17.411c-5.804,0-10.681-1.894-14.656-5.69c-3.959-3.796-5.934-9.429-5.934-16.907c0-9.372,1.455-17.493,4.357-24.361c2.886-6.869,6.747-12.892,11.543-18.086c4.804-5.194,11.274-11.356,19.427-18.501c7.145-6.251,12.307-10.965,15.485-14.144c3.186-3.186,5.861-6.73,8.031-10.632c2.187-3.91,3.26-8.145,3.26-12.721c0-8.933-3.308-16.46-9.957-22.597c-6.641-6.137-15.209-9.21-25.703-9.21c-12.282,0-21.321,3.097-27.125,9.291c-5.804,6.194-10.705,15.314-14.729,27.369c-3.804,12.616-11.006,18.923-21.598,18.923c-6.251,0-11.526-2.203-15.826-6.609c-4.292-4.406-6.438-9.177-6.438-14.314c0-10.6,3.406-21.346,10.21-32.23c6.812-10.884,16.745-19.899,29.807-27.036c13.054-7.145,28.296-10.722,45.699-10.722c16.184,0,30.466,2.991,42.854,8.966c12.388,5.966,21.963,14.087,28.718,24.361c6.747,10.266,10.128,21.427,10.128,33.482C299.635,165.473,297.709,173.789,293.856,180.934z"/></g></svg>
        </router-link>
        <Tooltip class="w-full" tip="Specifying this will duplicate your selected component for each item in the array before populating in the fields">
          <input class="input" type="text" v-model="key" placeholder="Path to iterate over, eg. data.allPosts">
        </Tooltip>
        <button aria-description="Generate elements with filled data" :class="[!fetcher ? 'cursor-not-allowed text-gray-400' : 'hover:text-blue-800 text-gray-800']" class="ml-2 p-2 leading-none font-semibold bg-gray-200 hover:bg-gray-300 rounded">
          Generate
        </button>
      </div>
      <div v-if="fetcher" class="relative flex-1 h-56">
        <GraphiQL
          key="graphiql"
          :fetcher="fetcher"
          :storage="storage"
          ref="graphiql"
        ></GraphiQL>
      </div>
      <p v-else class="block p-2 bg-gray-100 text-gray-900 rounded">Please enter your graphql url and click the "Load Schema" button to the right</p>
    </form>
  </div>
</template>

<script>
import { introspectionQuery, buildSchema, printSchema, buildClientSchema, validateSchema } from 'graphql'
import storage from '../storage'
import sdlSchema from 'raw-loader!../gql/schema.gql'
import Tooltip from '../components/Tooltip'

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
      headers: `{}`,
      jsonOpts: {
        mode: 'application/json',
        tabSize: 2,
        lineNumbers: true
      }
    }
  },
  methods: {
    createFetcher() {
      const endpoint = this.url
      if (endpoint) {
        storage.setItem('url', endpoint)
        const options = { method: 'post', headers: { 'Content-Type': 'application/json' } }
        this.fetcher = (param) => fetch(endpoint, { ...options, body: JSON.stringify(param) })
          .then(response => response.json())
      } else {
        this.fetcher = null
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
    Tooltip
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