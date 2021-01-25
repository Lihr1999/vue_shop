import Vue from 'vue'
// 导入 Button Form FormItem Input Message组件
import { Button, Form, FormItem, Input, Message } from 'element-ui'

// 利用Vue.use()挂载组件
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)

// Message组件需要挂载到Vue.prototype
Vue.prototype.$message = Message
