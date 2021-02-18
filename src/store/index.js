import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loginStatus: window.localStorage.getItem('token') ? 1 : 0,
    token: window.localStorage.getItem('token') ? window.localStorage.getItem('token') : '',
    username: window.localStorage.getItem('username') ? window.localStorage.getItem('username') : ''
  },
  // 只有mutations才有权力修改state的数据
  mutations: {
    setToken(state, params) {
      state.token = params.token
      state.loginStatus = 1
      state.username = params.username
    },
    removeToken(state) {
      state.token = ''
      state.loginStatus = 0
      state.username = ''
    }
  },
  actions: {
  },
  getters: {
  },
  modules: {
  }
})
