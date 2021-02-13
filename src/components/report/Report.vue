<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>数据报表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 2. 为ECharts准备一个具备大小（宽高）的Dom -->
            <div id="main" style="width: 750px;height:400px;"></div>
        </el-card>
    </div>
</template>

<script>
    // 1. 导入echarts
    import * as echarts from 'echarts'
    // 导入lodash
    import _ from 'lodash'
    export default {
        data() {
            return {
                // 折线图配置项
                options: {
                    title: {
                        text: '用户来源'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            label: {
                            backgroundColor: '#E9EEF3'
                            }
                        }
                    },
                    // 设置了之后可以通过右上角的下载按钮保存数据图片
                    toolbox: {
                        feature: {
                            saveAsImage: {}
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                        },
                    xAxis: [
                        {
                            boundaryGap: false
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ]
                }
            }
        },
        created() {},
        // 此时，页面上的元素，已经被渲染完毕了！所以能够获取id为main的div盒子
        async mounted() {
            // 获取后台图表数据
            const { data: res } = await this.$http.get('reports/type/1')
            if (res.meta.status !== 200) return this.$message.error('获取折线图数据失败！')

            // 3. 基于准备好的dom，初始化echarts实例
            var myChart = echarts.init(document.getElementById('main'))
            // 4. 准备指定图表的配置项和数据
                // _.merge(需要合并的对象1, 需要被合并的对象2)
                // 合并后台折线图数据和配置对象，最终的出来的对象才是真正的配置项和数据
            const result = _.merge(res.data, this.options)
            // 5. 展示数据
            myChart.setOption(result)
        }
    }
</script>

<style lang="less" scoped>
</style>
