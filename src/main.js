import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本对应的css样式
// import 'quill/dist/quill.core.css' // import styles
// import 'quill/dist/quill.snow.css' // for snow theme
// import 'quill/dist/quill.bubble.css' // for bubble theme

// 导入global.css
import './assets/css/global.css'

// 导入字体图标库
import './assets/fonts/iconfont.css'

// 导入tree-table
import TreeTable from 'vue-table-with-tree-grid'
// 把TreeTable通过Vue.use方式挂载到Vue身上
// Vue.use(TreeTable)
// 把TreeTable通过组件的方式挂载到Vue身上
// Vue.component('tree-table', TreeTable)

// 导入NProgress包的 js文件和css文件
import NProgress from 'nprogress'
// import 'nprogress/nprogress.css'

// 导入axios
import axios from 'axios'
// 设置axios的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 设置请求拦截器
// 在request请求拦截器中，展示进度条  NProgress.start()
axios.interceptors.request.use(config => {
  // console.log(config)
  // 展示NProgress进度条
  NProgress.start()
  // 设置请求头 location保存的方法
  // config.headers.Authorization = window.sessionStorage.getItem('token')
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后必须return回去config
  return config
})
// 设置响应拦截器
// 在response响应拦截器中，隐藏进度条  NProgress.done()
axios.interceptors.response.use(res => {
  // 隐藏NProgress进度条
  NProgress.done()
  return res
})

// 把axios放到Vue身上的原型对象身上
Vue.prototype.$http = axios

Vue.config.productionTip = false

// 把TreeTable通过Vue.use方式挂载到Vue身上
// Vue.use(TreeTable)

// 把TreeTable通过组件的方式挂载到Vue身上
Vue.component('tree-table', TreeTable)

// 将富文本编辑器注册为全局可用的组件
// Vue.use(VueQuillEditor, /* { default global options } */)
Vue.use(VueQuillEditor)

// 时间格式化过滤器
Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  // padStart是在字符串前面进行补位操作，getMonth等函数返回的是一个数字型，需要转为字符串，要么 + '' 或者 .toString()
  // padStart(长度多少, "不足长度时需要什么字符拼接")
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  // return `yyyy-mm-dd hh:mm:ss`   先定义格式，然后替换成变量 使用模板字符串方便替换变量
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
