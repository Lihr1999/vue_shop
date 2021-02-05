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
            <!-- 警告区域 -->
            <el-alert
                show-icon
                title="注意：只允许为第三级分类设置相关参数！"
                type="warning"
                :closable="false"
                >
            </el-alert>

            <!-- 选择商品分类区域 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>

                    <!-- 选择商品分类的级联选择框 -->
                     <el-cascader
                        v-model="selectedCateKeys"
                        :options="cateList"
                        :props="cateProps"
                        @change="handleChange"
                        clearable>
                    </el-cascader>
                </el-col>
            </el-row>

            <!-- Tabs标签页区域 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!-- 添加动态参数的面板 -->
                <el-tab-pane label="动态参数" name="many">
                    <!-- 添加参数的按钮 -->
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTableData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column  type="expand">
                            <template slot-scope="scope">
                                <!-- 循环渲染Tag标签 -->
                                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable :disable-transitions="false" @close="handleClose(index, scope.row)">{{ item }}</el-tag>
                                <!-- 输入的文本框 -->
                                <el-input
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)"
                                    >
                                </el-input>
                                <!-- 添加按钮 -->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column label="#" type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button icon="el-icon-edit" type="primary" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button icon="el-icon-delete" type="danger" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!-- 添加静态属性的面板 -->
                <el-tab-pane label="静态属性" name="only">
                    <!-- 添加属性的按钮 -->
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyTableData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column  type="expand">
                            <el-table-column  type="expand">
                                <template slot-scope="scope">
                                    <!-- 循环渲染Tag标签 -->
                                    <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable :disable-transitions="false" @close="handleClose(index, scope.row)">{{ item }}</el-tag>
                                    <!-- 输入的文本框 -->
                                    <el-input
                                        class="input-new-tag"
                                        v-if="scope.row.inputVisible"
                                        v-model="scope.row.inputValue"
                                        ref="saveTagInput"
                                        size="small"
                                        @keyup.enter.native="handleInputConfirm(scope.row)"
                                        @blur="handleInputConfirm(scope.row)"
                                        >
                                    </el-input>
                                    <!-- 添加按钮 -->
                                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                                </template>
                            </el-table-column>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column label="#" type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button icon="el-icon-edit" type="primary" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button icon="el-icon-delete" type="danger" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 添加对话框 -->
        <el-dialog
        :title="'添加' + titleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed">
            <!-- 添加参数的表单 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改参数对话框 -->
        <el-dialog
        :title="'修改' + titleText"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed">
            <!-- 修改参数的表单 -->
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                // 商品分类列表
                cateList: [],
                // 级联选择器的配置对象
                cateProps: {
                    expandTrigger: 'hover',
                    label: 'cat_name',
                    value: 'cat_id',
                    children: 'children'
                },
                // 级联选择器双向绑定到的数组
                selectedCateKeys: [],
                // 被激活的页签的名称
                activeName: 'many',
                // 动态参数的数据
                manyTableData: [],
                // 静态属性的数据
                onlyTableData: [],
                // 控制添加对话框的显示与隐藏
                addDialogVisible: false,
                // 添加表单的验证规则对象
                addFormRules: {
                    attr_name: [
                        { required: true, message: '请输入参数名称', trigger: 'blur' }
                    ]
                },
                // 添加参数的表单数据对象
                addForm: {
                    attr_name: ''
                },
                // 控制修改对话框的显示与隐藏
                editDialogVisible: false,
                // 修改的表单数据对象
                editForm: {},
                // 修改表单的验证规则对象
                editFormRules: {
                    attr_name: [
                        { required: true, message: '请输入参数名称', trigger: 'blur' }
                    ]
                }
            }
        },
        methods: {
            // 获取所有的商品分类列表
            async getCateList() {
                const { data: res } = await this.$http.get('categories')
                if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
                // 把获取过来的商品分类数据保存到cateList数组中
                this.cateList = res.data
                console.log(this.cateList)
            },
            // 级联选择器选中项变化，会触发这个函数
            handleChange() {
                this.getParamsData()
            },
            // tab 页签点击事件的处理函数
            handleTabClick() {
                // console.log(this.activeName)
                this.getParamsData()
            },
            // 获取参数的列表数据
            async getParamsData() {
                // 数组长度不等于3证明选中的不是三级分类
                if (this.selectedCateKeys.length !== 3) {
                    // 不是三级分类就清空selectedCateKeys数组
                    this.selectedCateKeys = []
                    // 清空动态参数的表格数据
                    this.manyTableData = []
                    // 清空静态属性的表格数据
                    this.onlyTableData = []
                    return
                }
                // 证明选中的是三级分类
                // console.log(this.selectedCateKeys)
                // 根据所选分类的id和当前所处的面板name值，获取对应的参数
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
                    params: {
                        sel: this.activeName
                    }
                })
                if (res.meta.status !== 200) return this.$message.error('获取参数列表失败！')
                // console.log(res.data)
                // console.log(res.data[0].attr_vals.split(' '))
                res.data.forEach(item => {
                    // 首先判断值是否为空对象，是空对象就返回空数组不进行split操作，不是空对象就进行split操作
                    item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
                    // 为item设置一个变量，用来控制修改对话框的显示与隐藏，默认值为false
                    item.inputVisible = false
                    // 为item设置一个变量，用来保存文本框中输入的内容
                    item.inputValue = ''
                })
                console.log(res.data)
                if (this.activeName === 'many') {
                    // 动态参数面板
                    this.manyTableData = res.data
                } else {
                    // 静态属性面板
                    this.onlyTableData = res.data
                }
            },
            // 监听添加对话框的关闭事件
            addDialogClosed() {
                // 重置表单验证信息
                this.$refs.addFormRef.resetFields()
            },
            // 点击按钮添加参数
            addParams() {
                this.$refs.addFormRef.validate(async valid => {
                    if (!valid) return this.$message.error('验证不通过！')
                    const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
                        attr_name: this.addForm.attr_name,
                        attr_sel: this.activeName
                    })
                    if (res.meta.status !== 201) return this.$message.error('添加参数失败！')
                    this.$message.success('添加参数成功！')
                    // 刷新数据
                    this.getParamsData()
                    // 关闭添加对话框
                    this.addDialogVisible = false
                })
            },
            // 点击编辑按钮展示修改对话框
            async showEditDialog(attrId) {
                // 根据id查询参数数据
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, {
                    params: {
                        attr_sel: this.activeName
                    }
                })
                if (res.meta.status !== 200) return this.$message.error('获取参数失败！')
                this.editForm = res.data
                this.editDialogVisible = true
            },
            // 监听关闭修改对话框的事件
            editDialogClosed() {
                // 重置表单验证信息
                this.$refs.editFormRef.resetFields()
            },
            // 点击对话框确定按钮，发起调用参数
            editParams() {
                this.$refs.editFormRef.validate(async valid => {
                    if (!valid) return this.$message.error('验证不通过！')
                    const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
                        attr_name: this.editForm.attr_name,
                        attr_sel: this.activeName
                    })
                    if (res.meta.status !== 200) return this.$message.error('修改参数失败！')
                    this.$message.success('修改参数成功！')
                    // 刷新数据
                    this.getParamsData()
                    // 隐藏对话框
                    this.editDialogVisible = false
                })
            },
            // 根据ID删除对应的参数项
            async removeParams(attrId) {
                const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)
                // 用户取消了删除的操作
                if (confirmResult !== 'confirm') return this.$message.info('已取消删除！')
                // 进行删除操作
                const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
                if (res.meta.status !== 200) return this.$message.error('删除参数失败！')
                // 刷新参数数据
                this.getParamsData()
            },
            // 文本框按下enter键或者失去了焦点时都会触发
            async handleInputConfirm(row) {
                // 内容为空的时候
                if (row.inputValue.trim().length === 0) {
                    // 清空内容
                    row.inputValue = ''
                    // 显示按钮，隐藏输入框
                    row.inputVisible = false
                    return
                }
                // 内容不为空的时候(输入了内容)则做后续处理
                // 把输入后的内容追加到row.attr_vals数组，供el-tag循环渲染
                row.attr_vals.push(row.inputValue.trim())
                // 清空输入框的内容
                row.inputValue = ''
                // 隐藏输入框
                row.inputVisible = false
                // 需要发起请求，保存这次操作
                this.saveAttrVals(row)
            },
            // 将对 attr_vals 的操作封装到一个函数里面
            async saveAttrVals(row) {
                // 调用接口进行编辑修改
                const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
                    attr_name: row.attr_name,
                    attr_sel: row.attr_sel,
                    attr_vals: row.attr_vals.join(' ')
                })
                if (res.meta.status !== 200) return this.$message.error('修改参数项失败！')
                this.$message.success('修改参数项成功！')
            },
            // 点击按钮，展示输入文本框
            showInput(row) {
                // 显示输入框
                row.inputVisible = true
                // 让文本框自动获取焦点
                // this.$nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.focus()
                })
            },
            // 删除对应的参数可选项
            handleClose(index, row) {
                // 对前端页面进行更新
                row.attr_vals.splice(index, 1)
                // 对数据库进行更新
                this.saveAttrVals(row)
            }
        },
        created() {
            this.getCateList()
        },
        computed: {
            // 如果按钮需要被禁用，则返回true，否则返回false
            isBtnDisabled() {
                if (this.selectedCateKeys.length !== 3) {
                    return true
                }
                return false
            },
            // 当前选中的三级分类的Id
            cateId() {
                if (this.selectedCateKeys.length === 3) {
                    return this.selectedCateKeys[2]
                }
                return null
            },
            // 动态计算标题的文本
            titleText() {
                if (this.activeName === 'many') return '动态参数'
                return '静态属性'
            }
        }
    }
</script>

<style lang="less" scoped>
.cat_opt {
    margin: 15px 0;
}
.el-tag {
    margin: 10px
}
.input-new-tag {
    width: 120px;
}
</style>
