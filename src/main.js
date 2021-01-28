import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入global.css
import './assets/css/global.css'
// 导入字体图标库
import './assets/fonts/iconfont.css'
// 导入axios
import axios from 'axios'
// 设置axios的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 设置请求拦截器
axios.interceptors.request.use(config => {
  // console.log(config)
  // 设置请求头
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后必须return回去config
  return config
})
// 把axios放到Vue身上的原型对象身上
Vue.prototype.$http = axios
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
