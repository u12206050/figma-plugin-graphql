import store from './store'

const listeners = []
const storage =  {
  _data       : {},
  setItem     (id, val) {
    this._data[id] = val
    save()
    return this._data[id]
  },
  getItem     (id) { return this._data.hasOwnProperty(id) ? this._data[id] : undefined; },
  removeItem  (id) {
    delete this._data[id];
    save()
  },
  clear       () {
    this._data = {};
    save()
    return this._data
  },
  onLoad  (fn) {
    listeners.push(fn)
  }
}

export function save() {
  store.commit('setStorage', storage._data)
}
export function load(data) {
  storage._data = data || {}
  save()
  listeners.forEach(fn => fn())
}

export default storage