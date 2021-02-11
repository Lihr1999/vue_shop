<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片试图区域 -->
        <el-card>
            <!-- 搜索框和添加商品按钮区域 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" @keyup.enter.native="getGoodsList" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"
                        ></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddpage">添加商品</el-button>
                </el-col>
            </el-row>

            <!-- table表格区域 -->
            <el-table :data="goodslist" border stripe>
                <!-- 索引列 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
                <el-table-column label="创建时间" width="140px">
                    <template slot-scope="scope">
                        {{ scope.row.add_time | dateFormat }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="editById(scope.row.goods_id)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[5, 10, 15, 20]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            background
            >
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                // 查询参数对象
                queryInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 10
                },
                // 商品列表数据
                goodslist: [],
                // 商品列表数据总条数
                total: 0
            }
        },
        methods: {
            // 根据分页获取对应的商品列表
            async getGoodsList() {
                const { data: res } = await this.$http.get('goods', {
                    params: this.queryInfo
                })
                if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
                // 把商品列表赋值到goodslist数组中
                this.goodslist = res.data.goods
                // 把商品列表的total总条数赋值到total中
                this.total = res.data.total
            },
            // 当一页显示条数发生变化的时候
            handleSizeChange(newSize) {
                // 把发生改变后最新的pagesize赋值到参数参数中
                this.queryInfo.pagesize = newSize
                // 重新获取商品列表的数据
                this.getGoodsList()
            },
            // 当 当前页数据发生变化的时候
            handleCurrentChange(newPage) {
                // 把发生改变后最新的pagenum赋值到参数参数中
                this.queryInfo.pagenum = newPage
                // 重新获取商品列表的数据
                this.getGoodsList()
            },
            // 根据ID删除商品
            async removeById(goodsId) {
                const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }).catch(err => err)
                if (confirmResult !== 'confirm') return this.$message.info('已取消删除！')
                const { data: res } = await this.$http.delete('goods/' + goodsId)
                if (res.meta.status !== 200) return this.$message.error('删除失败！')
                this.$message.success('删除成功！')
                // 刷新数据
                this.getGoodsList()
            },
            // 点击添加商品按钮，跳转到添加商品按钮页面
            goAddpage() {
                this.$router.push('/goods/add')
            },
            // 点击修改商品按钮，跳转到修改商品按钮页面
            editById(id) {
                this.$router.push('/goods/edit/' + id)
            }
        },
        created() {
            this.getGoodsList()
        }
    }
</script>

<style lang="less" scoped>
</style>
