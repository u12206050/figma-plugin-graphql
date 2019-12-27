// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
  width: 680,
  height: 680
});

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
let storeData
figma.ui.onmessage = async msg => {
  switch(msg.action) {
    case 'generate':
      if (msg.key) {
        const resArr = byPath(msg.data, msg.key)
        if (Array.isArray(resArr)) {
          let len = resArr.length
          const nodes: SceneNode[] = [];
          const template = figma.currentPage.selection[0]
          let x = template.x
          let y = template.y

          for (var i=0; i<len; ++i) {
            let cloned = template.clone()
            replacePlaceholders(resArr[i], cloned, i)
            if (i % 4 === 0) {
              x = template.x
              y = y + template.height + 40
            }
            cloned.x = x = x + template.width + 40
            cloned.y = y
            template.parent.appendChild(cloned);
            nodes.push(cloned);
          }
          figma.currentPage.selection = nodes;
          figma.viewport.scrollAndZoomIntoView(nodes);
        }
      } else figma.currentPage.selection.forEach(node => {
        replacePlaceholders(msg.data, node)
      })
    break
    case 'loadedImage':
      loadedImage(msg.data.url, msg.data.imgData)
    break
    case 'getStorage':
      storeData = await figma.clientStorage.getAsync("data");
      figma.ui.postMessage({
        action: 'storage',
        data: storeData
      });
    break
    case 'setStorage':
      storeData = msg.data;
      figma.clientStorage.setAsync("data", storeData);
    break
    default: figma.closePlugin();
  }
};

// This is a generator that recursively produces all the nodes in subtree
// starting at the given node
function* walkTree(node) {
  yield node;
  let children = node.children;
  if (children) {
    for (let child of children) {
      yield* walkTree(child)
    }
  }
}

function byPath(o, s) {
  s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  s = s.replace(/^\./, '');           // strip a leading dot
  var a = s.split('.');
  for (var i = 0, n = a.length; i < n; ++i) {
      var k = a[i];
      if (k in o) {
          o = o[k];
      } else {
          return;
      }
  }
  return o;
}

let queue = 0
const images = {}
function loadedImage(url, imgData) {
  if (images[url] && imgData) {
    images[url].imgData = imgData
    images[url].nodes.forEach(node => {
      replaceImage(node, imgData)
    })
  }
  if (!(--queue)) {
    figma.closePlugin();
  }
}

function loadImage(node, url) {
  if (!images[url]) {
    images[url] = {
      nodes: [node]
    }
    ++queue
    figma.ui.postMessage({
      action: 'getImage',
      data: {
        url: url,
        corsUrl: storeData.corsUrl
      }
    })
  } else if (images[url].imgData) {
    replaceImage(node, images[url].imgData)
  } else images[url].nodes.push(node)
}

function replaceImage(node, imgData) {
  node.fills = replacePaint(node.fills, imgData)
  node.strokes = replacePaint(node.strokes, imgData)
}

function replacePaint(paints, imgData) {
  console.log('replacing paints', paints)
  const newPaints = []
  for (const paint of paints) {
    if (paint.type === 'IMAGE') {
      const newPaint = clone(paint)
      newPaint.imageHash = figma.createImage(imgData).hash
      newPaints.push(newPaint)
    } else newPaints.push(paint)
  }
  return newPaints
}

function clone(val) {
  return JSON.parse(JSON.stringify(val))
}

function replacePlaceholders(obj, node, clonedIndex = -1) {
  console.log('replacePlaceholders', obj, node)
  let walker = walkTree(node)
  const placeholder = /{%([^%]+)%}/gm
  let timer;

  function processOnce() {
    let results = {};
    let count = 0;
    let done = true;
    ++queue;
    let res
    while (!(res = walker.next()).done) {
      let node = res.value
      console.log(node.type, node.name)
      if (false && node.type === 'TEXT') {
        let characters = node.characters
        let matches = characters.match(placeholder)
        if (matches) {
          console.log('matches', matches)
          matches.forEach(m => {
            let path = m.substring(2, m.length - 2).trim()
            if (path) {
              if (!results[path]) {
                results[path] = byPath(obj, path)
              }
              let exp = m.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
              console.log('replacing', exp, results[path])
              characters = characters.replace(new RegExp(exp, 'g'), results[path])
            }
            console.log('path', path, characters)
          })
          if (!node.hasMissingFont) {
            figma.loadFontAsync(node.fontName).then(() => {
              node.characters = characters
              processOnce()
            })
            done = false
            break
          } else node.characters = characters
        }
      } else {
        let matches = node.name.match(placeholder)
        console.log(node.name, matches)
        if (matches) {
          matches.forEach(m => {
            let path = m.substring(2, m.length - 2).trim()
            if (path) {
              // if (clonedIndex > -1) path = path.replace(/\[?\]/g, `[${clonedIndex}]`)
              if (!results[path]) {
                results[path] = byPath(obj, path)
              }
              if (typeof results[path] !== 'undefined') {
                switch (node.type) {
                  case 'TEXT': {
                    let newCharacters = node.name.replace(new RegExp(m.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'g'), results[path])
                    if (!node.hasMissingFont) {
                      figma.loadFontAsync(node.fontName).then(() => {
                        node.characters = newCharacters
                        processOnce()
                      })
                      done = false
                      break
                    } else node.characters = newCharacters
                    break
                  }
                  case 'RECTANGLE':
                  case 'ELLIPSE':
                  case 'POLYGON':
                  case 'STAR':
                  case 'VECTOR': {
                    if (results[path].indexOf('https://') === 0) {
                      console.log('image', results[path])
                      loadImage(node, results[path])
                      break
                    }
                  }

                  default: {
                    // not supported, silently do nothing
                  }
                }
              }
            }
          })
        }
      }
      if (++count === 1000) {
        done = false
        timer = setTimeout(processOnce, 20)
        break
      }
    }

    figma.ui.postMessage({
      action: 'processing',
      data: { results, done }
    })

    if (!(--queue) && done) {
      figma.closePlugin();
    }
  }

  if (typeof obj == 'object') {
    processOnce()
  } else figma.closePlugin();
}

console.log('v1.0.1')