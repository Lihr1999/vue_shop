<template>
    <div class='login_container'>
        <div class="login_box">
            <!-- 头像区域 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 登陆表单区域 -->
            <el-form label-width="0px" class="login_form" :model="loginForm" :rules="loginFormRelus" ref="loginFormRef">
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <el-input prefix-icon="iconfont icon-user" v-model="loginForm.username"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input prefix-icon="iconfont icon-3702mima" v-model="loginForm.password" type="password"></el-input>
                </el-form-item>
                <!-- 按钮区域 -->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetLoginForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
import { mapMutations } from 'vuex'
export default {
    data() {
        return {
            // 这是登录表单的数据绑定对象
            loginForm: {
                username: 'admin',
                password: '123456'
            },
            // 这是登录表单的数据验证规则
            loginFormRelus: {
                // 验证用户名是否合法
                username: [
                    { required: true, message: '请输入登录用户名', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                // 验证密码是否合法
                password: [
                    { required: true, message: '请输入登录密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        ...mapMutations(['setToken']),
        resetLoginForm() {
            this.$refs.loginFormRef.resetFields()
        },
        login() {
            this.$refs.loginFormRef.validate(async valid => {
                // console.log(valid) // true / false
                if (!valid) {
                    // 停止执行下面的代码
                    return false
                }
                // this.$http.post("xx", {})    // 第二个参数为传递的参数，默认是json格式
                const { data: res } = await this.$http.post('login', this.loginForm) // 因为form表单的数据是放在loginForm, 能直接传递这个对象
                // console.log(res)
                if (res.meta.status !== 200) {
                    this.$message.error('登录失败！')
                    window.localStorage.removeItem('token')
                }
                this.$message.success({
                    message: '登录成功！',
                    duration: 1000
                })
                 // 1. 将登录成功之后的 token，保存到客户端的 localStorage 中
                    // 服务器返回过来的session是在res.data.token
                    //   1.1 项目中出了登录之外的其他API接口，必须在登录之后才能访问
                    //   1.2 token 只应在当前网站打开期间生效，所以将 token 保存在 window.localStorage 中
                // 保存token
                window.localStorage.setItem('token', res.data.token)
                // 保存username
                window.localStorage.setItem('username', res.data.username)
                // 2. 保存token在vuex.state的token中
                this.setToken({
                    token: res.data.token,
                    username: res.data.username
                })
                // 3. 通过编程式导航跳转到后台主页，路由地址是 /home
                this.$router.push('/home')
            })
        }
    }
}
</script>

<style lang='less' scoped>
.login_container {
    background-color: #2b4b6b;
    height: 100%;
}

.login_box {
    width: 450px;
    height: 350px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .avatar_box {
        position: absolute;
        width: 130px;
        height: 130px;
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px #eee;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;
        img {
            height: 100%;
            width: 100%;
            border-radius: 50%;
            background-color: #eee;
        }
    }
}

.login_form {
    position: absolute;
    bottom: 0; // 设置了与高度相关的偏移 bottom top就不能设置height
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box; // 转为border-box盒模型。就可以把超出的内容继续往里面挤
}

.btns {
    display: flex;
    justify-content: flex-end;
}
</style>
