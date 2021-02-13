import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import GoodsList from '../components/goods/List.vue'
import Add from '../components/goods/Add.vue'
import Edit from '../components/goods/Edit.vue'
import Order from '../components/order/Order.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: Add },
      { path: '/goods/edit/:id', component: Edit },
      { path: '/orders', component: Order }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to.path 获取即将要跳转的路由地址
  // from.path 获取从哪个路由跳转而来
  // next() 是一个函数方法，是否放行/放行跳转到哪
    // next() 放行  next("/login") 强制跳转
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login') // 访问的路由不是登录页并且没有登录则强制跳转到登录页
  next() // 放行
})

export default router
