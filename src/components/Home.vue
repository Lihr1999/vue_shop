<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/l.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <span>你好！{{ $store.state.username }}</span>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主题区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 折叠div -->
        <div class="toggl--button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409Eff"
            :unique-opened="true"
            :collapse="isCollapse"
            :collapse-transition="false"
            router
            :default-active="activePath">
            <!-- 一级菜单 -->
            <!-- index只接收字符串，不接收数值，所以需要把item.id + '' -->
            <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
              <!-- 一级菜单的模板区域 -->
              <template slot="title">
                <!-- 一级菜单的字体图标 -->
                <i :class="iconsObj[item.id]"></i>
                <!-- 一级菜单的文本 -->
                <span>{{item.authName}}</span>
              </template>

              <!-- 二级菜单 -->
              <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
                <!-- 二级菜单的模板区域 -->
                <template slot="title">
                  <!-- 二级菜单的字体图标 -->
                  <i class="el-icon-menu"></i>
                  <!-- 二级菜单的文本 -->
                  <span>{{subItem.authName}}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menuList: [],
      // 一级菜单的字体图标
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 是否折叠菜单栏 默认为false
      isCollapse: false,
      // 被激活的链接地址
      activePath: ''
    }
  },
  methods: {
    logout() {
      // 清除session的token
      // window.sessionStorage.removeItem('token')
      // 清除store.state.token
      this.$store.commit('removeToken')
      // 清除用户名
      window.localStorage.removeItem('username')
      // 清除token
      window.localStorage.removeItem('token')
      // 重新跳转回登陆页面
      this.$router.push('/login')
    },
    // 获取所有的菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('res.meta.msg')
      this.menuList = res.data
    },
    // 点击按钮，切换菜单的折叠
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 点击按钮，保存路由地址到sessionStorage并且修改data身上的activePath
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  display: flex;
  justify-content: space-between; // 让子内容都贴近父盒子，中间的平均分布空白区域
  align-items: center;  // 侧轴垂直居中
  background-color: #373d41;
  padding-left: 0; // 去除左侧el-header的默认左侧padding值
  color: #fff;
  font-size: 20px;
  > div {
    display: flex; // 设置flex布局
    align-items: center; // 让侧轴垂直居中，让div里面的span文字垂直居中
    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #EAEDF1;
}
.iconfont {
  margin-right: 10px;
}
.toggl--button {
  background-color: #4a5064;
  color: #fff;
  font-size: 12px;
  line-height: 25px;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
