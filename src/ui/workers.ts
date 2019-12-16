import { load } from './storage'

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

window.onmessage = async (msgEvent) => {
  if (!msgEvent || !msgEvent.data || !msgEvent.data.pluginMessage) return
  const msg = msgEvent.data.pluginMessage
  switch(msg.action) {
    case 'getImage':
      const imgData = await fetch(`https://api.codetabs.com/v1/proxy?quest=${msg.data.url}`)
        .then(response => response.arrayBuffer())
        .then(buffer => new Uint8Array(buffer)).catch((err) => {
          console.log(err)
          return null
        })


      window.parent.postMessage({
        pluginMessage: {
          action: 'loadedImage',
          data: {
            url: msg.data.url,
            imgData
          }
        }
      }, '*')
    break
    case 'storage':
      console.log('storage', msg.data)
      load(msg.data)
    break;
  }
}
