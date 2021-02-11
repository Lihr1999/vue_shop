<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片试图区域 -->
        <el-card>
            <!-- 提示区域 -->
              <el-alert
                title="修改商品信息"
                type="info"
                center
                show-icon
                :closable="false">
            </el-alert>
            <!-- Steps步骤条 -->
            <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!-- 需要把el-form包裹住el-tabs -->
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" label-position="top">
                <!-- 竖向tab栏区域 -->
                <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
                    <!-- 基本信息面板 -->
                    <el-tab-pane label="基本信息" name="0">
                         <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="editForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="editForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="editForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="editForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader
                                v-model="editForm.goods_cat"
                                :options="catelist"
                                :props="cateProps"
                                @change="handleChange">
                            </el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <!-- 商品参数面板 -->
                    <el-tab-pane label="商品参数" name="1">
                        <!-- 渲染表单的item项 -->
                        <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                            <!-- 多选框组 -->
                            <el-checkbox-group v-model="item.attr_value">
                                <el-checkbox :label="cb"  v-for="(cb, index) in item.attr_value" :key="index" border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <!-- 商品属性面板 -->
                    <el-tab-pane label="商品属性" name="2">
                        <!-- 渲染表单的item项 -->
                        <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                            <el-input v-model="item.attr_value"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <!-- 商品图片面板 -->
                    <el-tab-pane label="商品图片" name="3">
                        <!-- action 表示图片要上传到的后台API图片上传接口地址 http://127.0.0.1:8888/api/private/v1/upload -->
                        <!-- :on-previe='handlePreview'  处理图片预览效果的操作的事件 -->
                        <!-- :on-remove='handleRemove'   处理移除图片的操作的事件 -->
                        <!-- list-type='picture'    文件列表的类型是 图片列表缩略图 -->
                        <el-upload
                        :action="uploadURL"
                        :on-preview="handlePreview"
                        :on-remove="handleRemove"
                        list-type="picture"
                        :headers="headerObj"
                        :on-success="handleSuccess"
                        :file-list="picsList">
                        <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <!-- 商品内容面板 -->
                    <el-tab-pane label="商品内容" name="4">
                        <!-- 富文本编辑器组件 -->
                        <quill-editor v-model="editForm.goods_introduce"/>
                        <!-- 添加商品的按钮 -->
                        <el-button type="primary" class="btnEdit" @click="edit">修改商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>

        <!-- 图片预览对话框 -->
        <el-dialog
        title="图片预览"
        :visible.sync="previewVisible"
        width="50%">
        <img :src="previewPath" alt="" class="previewImg">
        </el-dialog>
    </div>
</template>

<script>
    import _ from 'lodash'
    export default {
        data() {
            return {
                // 要修改的商品ID
                goods_id: '',
                // 设置当前进度的位置，索引值0代表第一个
                activeIndex: 0,
                // 添加表单的数据对象
                editForm: {
                    // 商品名称
                    goods_name: '',
                    // 商品价格
                    goods_price: 0,
                    // 商品重量
                    goods_weight: 0,
                    // 商品数量
                    goods_number: 0,
                    // 商品所属的分类数组
                    goods_cat: [],
                    // 图片的数组
                    pics: [],
                    // 商品的详情内容介绍，富文本的v-model
                    goods_introduce: '',
                    // 商品的参数(数组)
                    attrs: []
                },
                // 添加表单的验证规则对象
                editFormRules: {
                    // 商品名称的验证规则
                    goods_name: [
                        { required: true, message: '请输入商品名称', trigger: 'blur' }
                    ],
                    // 商品价格的验证规则
                    goods_price: [
                        { required: true, message: '请输入商品价格', trigger: 'blur' }
                    ],
                    // 商品重量的验证规则
                    goods_weight: [
                        { required: true, message: '请输入商品重量', trigger: 'blur' }
                    ],
                    // 商品数量的验证规则
                    goods_number: [
                        { required: true, message: '请输入商品重量', trigger: 'blur' }
                    ],
                    // 商品分类的验证规则
                    goods_cat: [
                        { required: true, message: '请输入商品分类', trigger: 'blur' }
                    ]
                },
                // 商品分类列表数据
                catelist: [],
                // 商品分类级联选择器的配置对象
                cateProps: {
                    expandTrigger: 'hover',
                    label: 'cat_name',
                    value: 'cat_id',
                    children: 'children'
                },
                // 动态参数列表数据
                manyTableData: [],
                // 静态属性列表数据
                onlyTableData: [],
                // 上传图片的URL地址
                uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
                // 图片上传组件的headers请求头对象
                headerObj: {
                    Authorization: window.sessionStorage.getItem('token')
                },
                // 保存预览图片的完整路径
                previewPath: '',
                // 控制图片预览的对话框的显示与隐藏
                previewVisible: false,
                // 存放渲染图片列表的数组
                picsList: []
            }
        },
        methods: {
            // 获取所有商品分类的数据
            async getCateList() {
                const { data: res } = await this.$http.get('categories')
                if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
                this.catelist = res.data
            },
            // 根据ID获取商品信息
            async getGoodList() {
                const { data: res } = await this.$http.get('goods/' + this.goods_id)
                if (res.meta.status !== 200) return this.$message.error('获取商品失败！')
                // 转为数组后将每一项转为数字型，即可实现默认选中级联选择器
                res.data.goods_cat = res.data.goods_cat.split(',').map(Number)
                // 添加两个属性，用来供图片渲染
                res.data.pics.forEach(item => {
                    item.name = item.pics_id
                    item.url = item.pics_sma_url
                })
                this.editForm = res.data
                // console.log(this.editForm)
            },
            // 级联选择器选中项变化时，会触发该函数
            handleChange() {
                console.log(this.editForm.goods_cat)
                // 如果选中的不是三级分类，那么就清空el-cascader的v-model的值
                if (this.editForm.goods_cat.length !== 3) {
                    this.editForm.goods_cat = []
                }
            },
            // 在面板切换之前触发
            beforeTabLeave(activeName, oldActiveName) {
                // console.log('即将离开的标签页名字是：' + oldActiveName)
                // console.log('即将进入的标签页名字是：' + activeName)
                // return false
                if (oldActiveName === '0' && this.editForm.goods_cat.length !== 3) {
                    this.$message.error('请选择商品分类！')
                    return false
                }
                // 清空渲染图片列表的数组
                this.picsList = []
            },
            // 当tab被选中时触发
            async tabClicked() {
                // 证明访问的是动态参数面板
                if (this.activeIndex === '1') {
                    // console.log('商品参数')
                    const data = this.editForm.attrs.filter(item => item.attr_sel === 'many')
                    // // 先把res.data下面的所有attr_vals进行转数组操作
                    data.forEach(item => {
                        if (Array.isArray(item.attr_value)) return
                        item.attr_value = item.attr_value.length === 0 ? [] : item.attr_value.split(' ')
                    })
                    this.manyTableData = data
                } else if (this.activeIndex === '2') {
                    // 证明访问的是静态属性面板
                    const data = this.editForm.attrs.filter(item => item.attr_sel === 'only')
                    this.onlyTableData = data
                } else if (this.activeIndex === '3') {
                    // 证明访问的是商品图片面板
                    this.editForm.pics.forEach(item => {
                        const picInfo = {
                            name: item.name,
                            url: item.url
                        }
                        this.picsList.push(picInfo)
                    })
                }
            },
            // 处理图片预览效果的操作
            handlePreview(file) {
                // console.log(file)
                // 把点击要预览的图片的完整路径赋值给previewPath，供图片预览的img的src使用
                this.previewPath = file.url
                // 显示图片预览对话框
                this.previewVisible = true
            },
            // 处理移除图片的操作
            handleRemove(file) {
                // console.log(file)
                // 1. 获取将要删除的图片的临时路径
                const filePath = file.url
                // 2. 从 pics 数组中，找到这个图片对应的索引值
                const index = this.editForm.pics.findIndex(item => {
                    return item.pics_sma_url === filePath
                })
                // 调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
                this.editForm.pics.splice(index, 1)
                // console.log(this.editForm)
            },
            // 监听文件上传成功的事件
            handleSuccess(response) {
                // console.log(response)
                // console.log(file)
                // 1.拼接得到一个图片信息对象
                const picInfo = {
                    pic: response.data.tmp_path
                }
                // 2.把上传成功的文件/图片临时路径保存到editForm的pics数组中
                this.editForm.pics.push(picInfo)
                // console.log(this.editForm)
            },
            // 修改商品
            edit() {
                // 先进行表单验证
                this.$refs.editFormRef.validate(async valid => {
                    if (!valid) return this.$message.error('请填写必要的表单项')
                    // 执行添加的业务逻辑
                    // 如果直接对editForm的goods_cat进行转字符串操作，会报错，因为级联选择器的v-model需要是数组
                        // 可以用lodash的cloneDeep进行深拷贝一个新对象用于参数的传递
                    this.editForm.attrs = []
                    const form = _.cloneDeep(this.editForm)
                    form.goods_cat = form.goods_cat.join(',')
                    // 处理动态参数
                   this.manyTableData.forEach(item => {
                        const newInfo = {
                            attr_id: item.attr_id,
                            attr_value: item.attr_value.join(' ')
                        }
                        form.attrs.push(newInfo)
                    })
                    // 处理静态属性
                    this.onlyTableData.forEach(item => {
                        const newInfo = {
                            attr_id: item.attr_id,
                            attr_value: item.attr_vals
                        }
                        form.attrs.push(newInfo)
                    })
                    // 最终把editForm.attrs数组赋值给form对象(提交参数所用的对象)
                    // form.attrs = this.editForm.attrs
                    // console.log(form)
                    // 发起修改商品
                    // 商品的名称 必须是唯一的
                    const { data: res } = await this.$http.put(`goods/${this.goods_id}`, form)
                    if (res.meta.status !== 200) return this.$message.error('修改商品失败！')
                    this.$message.success('修改商品成功！')
                    // 跳转回商品列表页面
                    this.$router.push('/goods')
                })
            }
        },
        created() {
            this.goods_id = this.$route.params.id
            this.getCateList()
            this.getGoodList()
        },
        computed: {
            cateId() {
                if (this.editForm.goods_cat.length !== 3) {
                    return null
                }
                return this.editForm.goods_cat[2]
            }
        }
    }
</script>

<style lang="less" scoped>
    .el-checkbox {
        margin: 0 10px 0 0 !important;
    }

    .previewImg {
        width: 100%;
    }
    .btnEdit {
        margin-top: 15px;
    }
</style>
