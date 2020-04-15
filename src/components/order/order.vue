<template>
  <div>
       <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区 -->
        <el-card>
            <!-- 搜索框 -->
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输出内容">
                        <el-button slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
            </el-row> 
            <!-- 订单数据的表格 -->
            <el-table :data="orderlist" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price"></el-table-column>
                <el-table-column label="是否付款">
                    <template slot-scope="scope">
                       <el-tag type="success" v-if="scope.row.pay_status==='1'">已付款</el-tag>
                       <el-tag type="danger" v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send"></el-table-column>
                <el-table-column label="下单时间">
                    <template slot-scope="scope">
                        {{scope.row.create_time|dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showDialog(scope)"></el-button>
                         <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressDialog"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryinfo.pagenum"
                :page-sizes="[1, 2, 5, 10, 15, 20]"
                :page-size="queryinfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total" background>
            </el-pagination>
        </el-card>
        <!-- 修改地址的对话框 -->
        <el-dialog title="修改地址" :visible.sync="addressdialogVisible" width="50%" @close="addressDialogClosed">
            <el-form :model="addressform" :rules="addressformRules" ref="addressformRef" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader :options="cityData" v-model="addressform.address1" clearable></el-cascader>
                </el-form-item>
                 <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addressform.address2"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
            <el-button @click="addressdialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editAddress">确 定</el-button>
            </span>
        </el-dialog>
         <!-- 物流信息的对话框 -->
        <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="50%" >
            <el-timeline>
                <el-timeline-item v-for="(activety,index) in progressinfo" :key="index" :timestamp="activety.time">
                    {{activety.context}}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
    created(){
        this.getOrderList()
    },
    data () {
        return {
            //获取订单列表的表单信息
            queryinfo:{
                query:'',
                pagenum:1,
                pagesize:10
            },
            //订单列表
            orderlist:[],
            //订单总数
            total:0,
            //控制修改地址的对话框的布尔值
            addressdialogVisible:false,
            //修改地址的表单信息
            addressform:{
                address1:[],
                address2:''
            },
            //修改地址的表单校验规则
            addressformRules:{
                address1:[
                     {required:true,message:'请选择省市区县',trigger:'blur'}
                ],
                 address2:[
                     {required:true,message:'请输入详细地址',trigger:'blur'}
                ],
            },
            //导入省市区县信息
            cityData:cityData,
            //控制物流消息的对话框显示的布尔值
            progressDialogVisible:false,
            //物流信息
            progressinfo:[]
        }
    },

    methods: {
        //请求获取订单列表
        async getOrderList(){
            const {data:res}=await this.$http.get('orders',{params:this.queryinfo})
            if(res.meta.status!==200){
                return this.$message.error('获取订单列表失败')
            }
            this.orderlist=res.data.goods
            this.total=res.data.total
        },
        //监听pagesize改变的函数
        handleSizeChange(newsize){
            this.queryinfo.pagesize=newsize
            this.getOrderList()
        },
        //监听pagenum改变的方法
        handleCurrentChange(newpage){
            this.queryinfo.pagenum=newpage
            this.getOrderList()
        },
        //显示修改地址的对话框
        showDialog(id){
            this.addressdialogVisible=true
            console.log(id)
        },
        //点击确定修改地址
        editAddress(){
             this.addressdialogVisible=false
        },
        //监听对话框关闭的事件
        addressDialogClosed(){
            this.$refs.addressformRef.resetFields()
        },
        //显示物流进度的对话框
        async showProgressDialog(){
            const {data:res}=await this.$http.get('/kuaidi/1106975712662')
            if(res.meta.status!==200){
                return this.$message.error('获取订单列表失败')
            }
            this.progressinfo=res.data
            this.progressDialogVisible=true
        }
    }
}

</script>
<style lang='less' scoped>

</style>
