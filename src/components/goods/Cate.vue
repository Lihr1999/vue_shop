<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>

            <!-- tree-table表格 -->
            <tree-table class="treeTable" :data='catelist' :columns='columns' :selection-type='false' :expand-type='false' :show-index='true' index-text='#' border :show-row-hover='false'>
                <!-- 是否有效列的模板 isok -->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" style="color: lightgreen" v-if="scope.row.cat_deleted === false"></i>
                    <i class="el-icon-error" style="color: red" v-else></i>
                </template>
                <!-- 排序列的模板 order -->
                <template slot='order' slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                    <el-tag type="warning" size="mini" v-else>三级</el-tag>
                </template>
                <!-- 操作列的模板 opt -->
                <template slot='opt' slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)">删除</el-button>
                </template>
            </tree-table>

            <!-- 分页 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[3, 5, 10, 15]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>

            <!-- 添加分类的对话框 -->
            <el-dialog
            title="添加分类"
            :visible.sync="addCateDialogVisible"
            width="50%"
            @close="addCateDialogClosed">
            <!-- 添加分类的表单 -->
            <el-form :model="addCateForm" :rules="cateFormRules" ref="addCateFormRef" label-width="80px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类">
                    <!-- :options 用来指定数据源 -->
                    <!-- v-model 用来保存选中的父级分类的id数组 -->
                    <!-- :props 用来指定级联选择器的配置对象 -->
                    <el-cascader
                    ref="cascader"
                    v-model="selectedKeys"
                    :options="parentCateList"
                    :props="cascaderProps"
                    @change="parentCateChanged"
                    clearable
                    >
                    </el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
            </el-dialog>

            <!-- 修改分类的对话框 -->
            <el-dialog
            title="修改分类"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editCateDialogClosed">
            <el-form :model="editForm" :rules="cateFormRules" ref="editFormRef" label-width="100px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="editForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCate">确 定</el-button>
            </span>
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                // 调用查询商品分类接口的查询条件
                queryInfo: {
                    type: 3,
                    // 当前页
                    pagenum: 1,
                    // 每页显示多少条数据
                    pagesize: 5
                },
                // 商品分类的数据列表，默认为空
                catelist: [],
                // 总数据条数
                total: 0,
                // 定义tree-table的column各列配置信息
                columns: [
                    {
                        label: '分类名称', prop: 'cat_name'
                    },
                    {
                        label: '是否有效',
                        // 表示将当前列定义为模板列
                        type: 'template',
                        // 表示当前这一列使用template身上的slot='isok'
                        template: 'isok'
                    },
                    {
                        label: '排序',
                        // 表示将当前列定义为模板列
                        type: 'template',
                        // 表示当前这一列使用template身上的slot='order'
                        template: 'order'
                    },
                    {
                        label: '操作',
                        // 表示将当前列定义为模板列
                        type: 'template',
                        // 表示当前这一列使用template身上的slot='opt'
                        template: 'opt'
                    }
                ],
                // 控制添加分类对话框的显示与隐藏
                addCateDialogVisible: false,
                // 添加分类的表单数据对象
                addCateForm: {
                    // 要添加的分类名称
                    cat_name: '',
                    // 父级分类的id 如果要添加1级分类，则父分类Id应该设置为 0
                    cat_pid: 0,
                    // 分类的等级，默认添加的是1级分类 `0`表示一级分类；`1`表示二级分类；`2`表示三级分类
                    cat_level: 0
                },
                // 添加分类的表单验证规则对象
                cateFormRules: {
                    // 分类名称的验证规则
                    cat_name: [
                        { required: true, message: '请输入分类名称', trigger: 'blur' }
                    ]
                },
                // 父级分类的列表
                parentCateList: [],
                // 指定级联选择器的配置对象
                cascaderProps: {
                    // 每一项所渲染的文本的属性值
                    label: 'cat_name',
                    // 每一项所绑定的值
                    value: 'cat_id',
                    // 渲染子选项的属性值
                    children: 'children',
                    // 展开选项的方式
                    expandTrigger: 'hover',
                    // 开启选择任意一级选项
                    checkStrictly: true
                },
                // 选中的父级分类的Id数组
                selectedKeys: [],
                // 控制修改分类对话框的显示与隐藏
                editDialogVisible: false,
                // 修改分类的表单数据对象
                editForm: {}
            }
        },
        methods: {
            // 获取商品分类数据
            async getCateList() {
                const { data: res } = await this.$http.get('categories', {
                    params: this.queryInfo
                })
                if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
                // 后台传回来的数据是一个对象，这个对象下面的result才是需要用到的数据
                // 把后台数据(res.data.result)赋值给catelist数组
                this.catelist = res.data.result
                // 为总数据条数赋值
                this.total = res.data.total
            },
            // 监听 pagesize 改变
            handleSizeChange(newSize) {
                // 为查询参数的pagesize重新赋值
                this.queryInfo.pagesize = newSize
                // 重新调用后台数据
                this.getCateList()
            },
            // 监听 pagenum 改变
            handleCurrentChange(newPage) {
                // 为查询参数的pagenum重新赋值
                this.queryInfo.pagenum = newPage
                // 重新调用后台数据
                this.getCateList()
            },
            // 点击添加分类按钮，展示添加分类的对话框
            showAddCateDialog() {
                // 先获取父级分类数据列表
                this.getParentCateList()
                // 再展示出对话框
                this.addCateDialogVisible = true
            },
            // 获取父级分类的数据列表
            async getParentCateList() {
                const { data: res } = await this.$http.get('categories', {
                    params: {
                        type: 2
                    }
                })
                if (res.meta.status !== 200) return this.$message.error('获取父级分类数据列表失败！')
                // 数据保存在parentCateList数组中
                this.parentCateList = res.data
            },
            // 级联选择器选择项发生变化触发这个函数
            parentCateChanged() {
                console.log(this.selectedKeys)
                // 如果 selectedKeys 数组中的 length > 0，证明选中了父级分类，并且只需要拿到数组中最后一项的id值即可
                // 如果选中了一级那么就拿数组中最后一项的id值
                // 如果选中了二级那么也是拿数组中最后一项的id值
                // 反之，就说明没有选中任何父级分类
                if (this.selectedKeys.length > 0) {
                    // 父级分类id
                    this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                    // 为当前分类的等级赋值
                    this.addCateForm.cat_level = this.selectedKeys.length
                } else {
                    // 父级分类id
                    this.addCateForm.cat_pid = 0
                    // 为当前分类的等级赋值
                    this.addCateForm.cat_level = 0
                }
            },
            // 添加按钮，添加新的分类
            addCate() {
                this.$refs.addCateFormRef.validate(async valid => {
                    if (!valid) return this.$message.error('验证未通过!')
                    const { data: res } = await this.$http.post('categories', this.addCateForm)
                    if (res.meta.status !== 201) return this.$message.error('添加分类失败！')
                    this.$message.success('添加分类成功！')
                    // 刷新数据列表
                    this.getCateList()
                    // 隐藏对话框
                    this.addCateDialogVisible = false
                })
            },
            // 监听添加分类对话框的关闭事件，重置表单数据
            addCateDialogClosed() {
                // 重置el-form表单
                this.$refs.addCateFormRef.resetFields()
                // 清空selectedKeys的父级分类的id数组
                this.selectedKeys = []
                // 清空添加分类的表单数据对象的父级分类id
                this.addCateForm.cat_pid = 0
                // 清空添加分类的表单数据对象的分类等级
                this.addCateForm.cat_level = 0
            },
            // 监听修改分类对话框的关闭事件，重置表单验证信息
            editCateDialogClosed() {
                // 重置表单验证信息
                this.$refs.editFormRef.resetFields()
                // 并且重置this.editForm修改分类的信息
                this.editForm = {}
            },
            // 点击编辑按钮，显示修改分类的对话框，并且把当前行的分类名称保存到变量上，供后续的分类对话框使用
            async showEditDialog(role) {
                // 根据id调用接口获取即将要修改的分类信息
                const { data: res } = await this.$http.get('categories/' + role.cat_id)
                if (res.meta.status !== 200) return this.$message.error('获取分类信息失败！')
                // 把返回的信息保存到变量中
                this.editForm = res.data
                // 展示对话框
                this.editDialogVisible = true
            },
            // 修改按钮，修改分类名称
            async editCate() {
                const { data: res } = await this.$http.put('categories/' + this.editForm.cat_id, {
                    cat_name: this.editForm.cat_name
                })
                if (res.meta.status !== 200) return this.$message.error('修改分类失败！')
                this.$message.success('修改分类成功！')
                // 刷新分类数据
                this.getCateList()
                // 关闭对话框
                this.editDialogVisible = false
            },
            // 根据id删除分类
            async removeCateById(id) {
                const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(error => error)
                if (confirmResult === 'cancel') return this.$message.info('已取消删除！')
                const { data: res } = await this.$http.delete('categories/' + id)
                if (res.meta.status !== 200) return this.$message.error('删除失败！')
                this.$message.success('删除成功！')
                // 刷新数据
                this.getCateList()
            }
        },
        created() {
            this.getCateList()
        },
        watch: {
            selectedKeys() {
                if (this.$refs.cascader) {
                    // 监听只要选择了父级分类的id值
                    // 保存父级分类的id值的数组 只要发生变化 就会隐藏级联选择器
                    this.$refs.cascader.dropDownVisible = false
                }
            }
        }
    }
</script>

<style lang="less" scoped>
.treeTable {
    margin-top: 15px;
}
.el-cascader {
    width: 100%;
}
</style>
