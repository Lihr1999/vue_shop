<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索输入框 -->
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" @keyup.enter.native="getOrderList" clearable @clear="getOrderList">
                        <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- 订单列表 表格 -->
            <el-table :data="orderlist" border stripe>
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price"></el-table-column>
                <el-table-column label="是否付款" prop="order_pay">
                    <template slot-scope="scope">
                        <el-tag type="success" v-if="scope.row.order_pay === 1">已付款</el-tag>
                        <el-tag type="danger" v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send"></el-table-column>
                <el-table-column label="下单时间" prop="create_time">
                    <template slot-scope="scope">
                        {{ scope.row.create_time | dateFormat }}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template>
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
                        <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[5, 10, 15]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
        </el-card>
        <!-- 修改地址对话框 -->
        <el-dialog
        title="修改地址"
        :visible.sync="addressVisible"
        width="50%"
        @close="addressDialogClosed">
        <el-form :model="addressForm" :rules="addressRules" ref="addressFormRef" label-width="100px">
            <el-form-item label="省市区/县" prop="address1">
                <el-cascader :options="cityData" v-model="addressForm.address1" :props="addressProps"></el-cascader>
            </el-form-item>
            <el-form-item label="详细地址" prop="address2">
                <el-input v-model="addressForm.address2"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addressVisible = false">取 消</el-button>
            <el-button type="primary" @click="addressVisible = false">确 定</el-button>
        </span>
        </el-dialog>
        <!-- 物流进度对话框 -->
        <el-dialog
        title="物流进度"
        :visible.sync="progressVisible"
        width="50%">
        <el-timeline>
            <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time">
            {{activity.context}}
            </el-timeline-item>
        </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
import cityData from './citydata.js'
    export default {
        data() {
            return {
                queryInfo: {
                    query: '',
                    // 当前页
                    pagenum: 1,
                    // 一页显示多少条数据
                    pagesize: 10
                },
                // 总数居条数
                total: 0,
                // 订单数据数组
                orderlist: [],
                // 控制修改地址对话框的显示与隐藏
                addressVisible: false,
                // 修改地址的表单
                addressForm: {
                    // 级联选择器，绑定的是一个数组
                    address1: [],
                    // 文本，绑定的是一个字符串
                    address2: ''
                },
                // 修改地址的表单验证规则
                addressRules: {
                    // 省市区/县的验证规则
                    address1: [
                        { required: true, message: '请选择省市区/县', trigger: 'blur' }
                    ],
                    // 详细地址的验证规则
                    address2: [
                        { required: true, message: '请填写详细地址', trigger: 'blur' }
                    ]
                },
                // 省市区/县的数据
                cityData: cityData,
                // 级联选择器的配置对象
                addressProps: {
                    expandTrigger: 'hover',
                    children: 'children'
                },
                // 控制物流信息对话框的显示与隐藏
                progressVisible: false,
                // 物流信息数组
                progressInfo: []
            }
        },
        methods: {
            // 获取订单数据列表
            async getOrderList() {
                const { data: res } = await this.$http.get('orders', {
                    params: this.queryInfo
                })
                if (res.meta.status !== 200) return this.$message.error('获取订单数据列表失败！')
                this.total = res.data.total
                this.orderlist = res.data.goods
            },
            // 当页条数发生变化时
            handleSizeChange(newSize) {
                this.queryInfo.pagesize = newSize
                this.getOrderList()
            },
            // 当前页发生变化时
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage
                this.getOrderList()
            },
            // 显示修改地址对话框
            showBox() {
                this.addressVisible = true
            },
            // 监听修改地址对话框关闭的时候
            addressDialogClosed() {
                this.$refs.addressFormRef.resetFields()
            },
            // 显示物流信息对话框
            async showProgressBox() {
                // 获取物流信息 /kuaidi/:id
                // 根据文档，仅提供一个测试运单号 1106975712662
                // const { data: res } = await this.$http.get('/kuaidi/804909574412544580')
                const { data: res } = await this.$http.get('https://www.liulongbin.top:8888/api/private/v1/kuaidi/804909574412544580')
                if (res.meta.status !== 200) return this.$message.error('获取物流信息失败！')
                // console.log(res)
                this.progressInfo = res.data
                this.progressVisible = true
            }
        },
        created() {
            this.getOrderList()
        }
    }
</script>

<style lang="less" scoped>
</style>
