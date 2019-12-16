import Vue from 'vue';

function hashCode(str: String) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    let character = str.charCodeAt(i);
    hash = (hash << 5) - hash + character;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

const tmpCache = {};
Vue.prototype.$fetch = function(
  url,
  query,
  variables = {},
  headers = {},
  cache
) {
  const body = JSON.stringify({
    variables,
    query
  });
  let hash = null;
  if (cache) {
    hash = hashCode(body);
    if (tmpCache[hash] && Date.now() < tmpCache[hash].ts) {
      return tmpCache[hash].result;
    }
  }

  return fetch(url, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  }).then(res => {
    const result = res.json();
    if (cache && hash) {
      tmpCache[hash] = {
        ts: Date.now() + 300000,
        result
      };
    }
    return result;
  });
};
