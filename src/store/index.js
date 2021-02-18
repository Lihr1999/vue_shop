import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: null,
    username: window.localStorage.getItem('username')
  },
  // 只有mutations才有权力修改state的数据
  mutations: {
  },
  actions: {
  },
  getters: {
  },
  modules: {
  }
})
