<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <!-- 添加角色按钮区 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表区域 -->
            <el-table :data="roleList" stripe border>
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级和三级权限 -->
                            <el-col :span="19">
                                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag closable @close="removeRightById(scope.row, item2.id)" type="success">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag closable @close="removeRightById(scope.row, item3.id)" type="warning" v-for="(item3) in item2.children" :key="item3.id">{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeUserById(scope.row.id)">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 添加角色的对话框 -->
            <el-dialog
                title="添加角色"
                :visible.sync="addDialogVisible"
                width="50%"
                @close="addDialogClosed">
                <el-form :model="addForm" :rules="FormRules" ref="addFormRef" label-width="80px">
                    <el-form-item label="角色名称" prop="roleName">
                        <el-input v-model="addForm.roleName"></el-input>
                    </el-form-item>
                    <el-form-item label="角色描述" prop="roleDesc">
                        <el-input v-model="addForm.roleDesc"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addRole">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 角色编辑的对话框 -->
            <el-dialog
                title="修改角色"
                :visible.sync="editDialogVisible"
                width="50%"
                @close="editDialogClosed">
                <el-form :model="editForm" :rules="FormRules" ref="editFormRef" label-width="80px">
                    <el-form-item label="角色名称" prop="roleName">
                        <el-input v-model="editForm.roleName"></el-input>
                    </el-form-item>
                    <el-form-item label="角色描述" prop="roleDesc">
                        <el-input v-model="editForm.roleDesc"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 分配权限的对话框 -->
            <el-dialog
                title="分配权限"
                :visible.sync="setRightDialogVisible"
                width="50%"
                @close="resetSetRightDialog">
                <!-- 树形控件 -->
                <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="setRightDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="allotRights()">确 定</el-button>
                </span>
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                // 所有角色列表数据
                roleList: [],
                // 控制添加角色对话框的显示与隐藏
                addDialogVisible: false,
                // 添加角色的表单数据
                addForm: {
                    roleName: '',
                    roleDesc: ''
                },
                // 角色表单的验证规则对象
                FormRules: {
                    // 角色名称的验证规则
                    roleName: [
                        { required: true, message: '请输入角色名称', trigger: 'blur' },
                        { min: 2, max: 10, message: '角色名称长度在 2 到 10 个字符', trigger: 'blur' }
                    ],
                    // 角色描述的验证规则
                    roleDesc: [
                        { min: 2, max: 10, message: '角色描述长度在 2 到 10 个字符', trigger: 'blur' }
                    ]
                },
                // 修改角色的表单数据
                editForm: {},
                // 控制编辑角色对话框的显示与隐藏
                editDialogVisible: false,
                // 控制权限分配对话框的显示与隐藏
                setRightDialogVisible: false,
                // 所有权限列表数据
                rightsList: [],
                // 树形控件的属性绑定对象
                treeProps: {
                    label: 'authName', // 通过哪个值渲染数据
                    children: 'children' // 父子节点通过哪个属性进行嵌套
                },
                // 默认选择的节点id值数组
                defKeys: [],
                // 当前即将分配权限的角色id
                roleId: ''
            }
        },
        created() {
            this.getRolesList()
        },
        methods: {
            // 获取角色列表数据
            async getRolesList() {
                const { data: res } = await this.$http.get('roles')
                if (res.meta.status !== 200) return this.$message.error('获取角色列表失败！')
                this.roleList = res.data
            },
            // 监听添加角色对话框关闭时的事件
            addDialogClosed() {
                this.$refs.addFormRef.resetFields()
            },
            // 添加角色
            addRole() {
                this.$refs.addFormRef.validate(async valid => {
                    if (!valid) return this.$message.error('验证不通过！')
                    // 调用接口添加角色
                    const { data: res } = await this.$http.post('roles', this.addForm)
                    if (res.meta.status !== 201) return this.$http.error('添加角色失败！')
                    this.$message.success('添加角色成功！')
                    // 隐藏添加用户的对话框
                    this.addDialogVisible = false
                    // 重新获取角色列表数据
                    this.getRolesList()
                })
            },
            // 监听修改角色对话框关闭的事件
            editDialogClosed() {
                this.$refs.editFormRef.resetFields()
            },
            // 根据id修改角色
            async showEditDialog(id) {
                // console.log(id)
                // 调用接口根据id获取角色信息
                const { data: res } = await this.$http.get('roles/' + id)
                if (res.meta.status !== 200) return this.$message.error('获取角色信息失败！')
                this.editForm = res.data
                // 显示编辑对话框
                this.editDialogVisible = true
            },
            // 确认修改角色
            saveRoleInfo() {
                this.$refs.editFormRef.validate(async valid => {
                    if (!valid) return this.$message.error('验证不通过！')
                    const { data: res } = await this.$http.put(`roles/${this.editForm.roleId}`, this.editForm)
                    if (res.meta.status !== 200) return this.$message.error('更新角色失败！')
                    this.$message.success('更新角色成功！')
                    // 刷新数据
                    this.getRolesList()
                    // 关闭对话框
                    this.editDialogVisible = false
                })
            },
            // 根据id删除对应的角色信息
            async removeUserById(id) {
                // 弹框提示用户是否要删除
                const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)
                if (confirmResult !== 'confirm') return this.$message.info('已取消删除！')
                const { data: res } = await this.$http.delete('roles/' + id)
                if (res.meta.status !== 200) return this.$message.error('删除角色失败！')
                this.$message.success('删除角色成功！')
                // 刷新数据
                this.getRolesList()
            },
            // 根据id删除对应的权限
            async removeRightById(role, rightId) {
                // 弹框提示用户是否要删除
                const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)
                if (confirmResult !== 'confirm') return this.$message.info('已取消删除！')
                const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
                if (res.meta.status !== 200) return this.$message.error('删除权限失败！')
                this.$message.success('删除权限成功！')
                // 不能使用刷新数据，否则页面会发生刷新
                // this.getRolesList()
                // res.data已经是处于一级权限的数据，包含二级和三级的children
                role.children = res.data // 因为role.children = scope.row.chilren，并且传回来的数据已经是一级权限的数据，所以直接赋值
            },
            // 展示权限分配的对话框
            async showSetRightDialog(role) {
                // 保存即将分配权限的角色id
                this.roleId = role.id
                // 获取所有权限列表的数据
                const { data: res } = await this.$http.get('rights/tree')
                if (res.meta.status !== 200) return this.$message.error('获取权限列表失败！')
                this.rightsList = res.data
                this.getLeafKeys(role, this.defKeys) // 调用递归函数，获取所有的三级权限的id值并且追加到defKeys数组中
                // console.log(this.rightsList)
                this.setRightDialogVisible = true
            },
            // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys 数组中
            getLeafKeys(node, arr) {
                // 如果该节点下面没有children属性，那么就是三级权限，直接把id 追加到defKyes数组中
                if (!node.children) return arr.push(node.id)
                // 如果该节点下面有children属性，那么就对它循环遍历每一项children，并且每一项都要调用一次此方法
                node.children.forEach(item => {
                    this.getLeafKeys(item, arr)
                })
                // 例如：一开始都是传的角色列表的数据，先通过判断是否有children，
                // 会发现有，那么就把角色列表下面第一个children(一级权限)进行循环，然后这个一级权限下面有children(二级权限)
                // 就把二级权限进行循环，会发现二级权限下面还有children(三级权限)
                // 就把三级权限进行循环，会发现没有children，就直接把这个三级权限的数组下面的所有对象的id都追加到数组
            },
            // 监听关闭权限分配的对话框关闭事件
            resetSetRightDialog() {
                // 权限分配的对话框关闭的时候清空defKeys数组的数据
                this.defKeys = []
            },
            // 点击确认按钮的时候为角色分配权限
            async allotRights(role) {
                const keys = [
                    ...this.$refs.treeRef.getCheckedKeys(),
                    ...this.$refs.treeRef.getHalfCheckedKeys()
                ].join(',')
                const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: keys })
                if (res.meta.status !== 200) return this.$message.error('分配权限失败！')
                this.$message.success('分配权限成功！')
                // 刷新列表数据
                this.getRolesList()
                // 隐藏对话框
                this.setRightDialogVisible = false
            }
        }
    }
</script>

<style lang="less" scoped>
.bdtop {
    border-top: 1px solid #eee;
}
.bdbottom {
    border-bottom: 1px solid #eee;
}
.el-tag {
    margin: 8px;
}
.vcenter {
    display: flex;
    align-items: center;
}
</style>
