<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      // 清除session的token
      window.sessionStorage.removeItem('token')
      // 重新跳转回登陆页面
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
