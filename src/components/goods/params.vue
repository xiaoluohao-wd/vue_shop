<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
        <!-- 警告信息 -->
        <el-alert show-icon title="注意！只允许为第三级分类配置参数" type="warning" :closable="false"></el-alert>
        <!-- 选择商品分类区域 -->
        <el-row class="cat_opt">
            <el-col>
                <span>选择商品分类:</span>
                <!-- 级联选择框 options用来指定数据元 props用来指定配置对象 -->
                <el-cascader expand-trigger="hover" :options="catelist"
                  :props="cascadeProps" v-model="selectedKeys" 
                  @change="handleChange" clearable size="mini"  change-on-select>
                </el-cascader>
            </el-col>
        </el-row>
        <!-- tab页签区域 -->
         <el-tabs v-model="activeName" @tab-click="handleClick">
            <!-- 添加动态参数的面板 -->
            <el-tab-pane label="动态参数" name="many">
                <el-button type="primary" @click="showDialog" :disabled="isBtnDiabled"  size="mini">添加参数</el-button>
                <!-- 动态参数的表格 -->
                <el-table :data="manyTableData" border stripe>
                    <!-- 展开行 -->
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <!-- 循环渲染tag标签 -->
                             <el-tag closable @close="handleClose(index,scope.row)" v-for="(item,index) in scope.row.attr_vals" :key="index">
                                 {{item}}
                             </el-tag>
                            <!-- 输入文本框 -->
                            <el-input class="input-new-tag" v-if="scope.row.inputVisible" 
                              v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                              @keyup.enter.native="handleInputConfirm(scope.row)" 
                               @blur="handleInputConfirm(scope.row)"></el-input>
                            <!--添加按钮  -->
                            <el-button  v-else class="button-new-tag" size="small" @click="showInput(scope.row)">new-tag</el-button>
                        </template>
                       
                    </el-table-column>
                    <!-- 索引列 -->
                    <el-table-column type="index"></el-table-column>
                    <!-- 参数名称列 -->
                    <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                    <!-- 操作列 -->
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)" size="mini">修改</el-button>
                            <el-button type="danger" icon="el-icon-delete"  @click="showRemoveDialog(scope.row.attr_id)" size="mini">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <!-- 添加静态属性的面板 -->
            <el-tab-pane label="静态属性" name="only">
                <el-button type="primary" @click="showDialog" :disabled="isBtnDiabled" size="mini">添加属性</el-button>
                <!-- 静态属性的表格 -->
                <el-table :data="onlyTableData" border stripe>
                    <!-- 展开行 -->
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <!-- 循环渲染tag标签 -->
                             <el-tag closable @close="handleClose(index,scope.row)" v-for="(item,index) in scope.row.attr_vals" :key="index">
                                 {{item}}
                             </el-tag>
                            <!-- 输入文本框 -->
                            <el-input class="input-new-tag" v-if="scope.row.inputVisible" 
                              v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                              @keyup.enter.native="handleInputConfirm(scope.row)" 
                               @blur="handleInputConfirm(scope.row)"></el-input>
                            <!--添加按钮  -->
                            <el-button  v-else class="button-new-tag" size="small" @click="showInput(scope.row)">new-tag</el-button>
                        </template>
                    </el-table-column>
                    <!-- 索引列 -->
                    <el-table-column type="index"></el-table-column>
                    <!-- 参数名称列 -->
                    <el-table-column label="属性列表" prop="attr_name"></el-table-column>
                    <!-- 操作列 -->
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-serach" @click="showEditDialog(scope.row.attr_id)" size="mini">修改</el-button>
                            <el-button type="danger" icon="el-icon-delete"  @click="showRemoveDialog(scope.row.attr_id)" size="mini">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
        :title="'添加'+titleText"
        :visible.sync="addParamsDialogVisible"
        width="50%" @closed="addParamsDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="addParamsForm" :rules="addParamsFormRules" ref="addParamsFormRef" label-width="80px">
          <el-form-item :label="titleText" prop="attr_name">
              <el-input v-model="addParamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>  
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 编辑参数对话框 -->
    <el-dialog
        :title="'修改'+titleText"
        :visible.sync="editParamsDialogVisible"
        width="50%" @closed="editParamsDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="editParamsForm" :rules="addParamsFormRules" ref="editParamsFormRef" label-width="80px">
          <el-form-item :label="titleText" prop="attr_name">
              <el-input v-model="editParamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>  
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
    created(){
        this.getcatelist()
    },
    data () {
        return {
            catelist:[],
            cascadeProps:{
                value:'cat_id',
                label:'cat_name',
                children:'children'
            },
            //级联选择框双向绑定的数组
            selectedKeys:[],
            //被激活的页签的名称
            activeName:'many',
            //动态参数的数据
            manyTableData:[],
            //静态属性的数据
            onlyTableData:[],
            //控制添加对话框的显示的布尔值
            addParamsDialogVisible:false,
            //添加参数的表单信息
            addParamsForm:{
                attr_name:'',
            },
            //添加参数的表单校验规则
            addParamsFormRules:{
                attr_name:[
                    {required:true,message:'请输出参数名称',trigger:'blur'}
                ]
            },
            //控制修改对话框的显示的布尔值
            editParamsDialogVisible:false,
            //修改参数的表单信息
            editParamsForm:{},
        }
    },

    methods: {
        //获取商品分类的列表
        async getcatelist(){
            const {data:res}=await this.$http.get('/categories',{params:this.queryinfo})
            if(res.meta.status!==200){
                return this.$message.error('获取分类信息失败')
            }
            this.catelist=res.data
        },
        //获取参数列表的请求函数
        async getparamslist(){
             if(this.selectedKeys.length!==3){
                this.selectedKeys=[]
                this.manyTableData=[]
                this.onlyTableData=[]
                return
            }
            //根据所选分类的id和当前所属的面板获取参数‘
            const {data:res}=await this.$http.get(`categories/${this.cateid}/attributes`,{params:{sel:this.activeName}})
            if(res.meta.status!==200){
                return this.$message.error('获取参数列表失败')
            }
            res.data.forEach(item=>{
                item.attr_vals=item.attr_vals ? item.attr_vals.split(','):[]
                //添加一个布尔值控制文本框的显示与隐藏
                item.inputVisible=false
                item.inputValue=''
           })
            if(this.activeName==='many'){
                this.manyTableData=res.data
            }
            else{
                this.onlyTableData=res.data
            }
        },
        //级联选择框变化时触发
        async handleChange(){
           this.getparamslist()
        },
        //点击tab标签页时触发
        handleClick(){
            this.getparamslist()
        },
        //显示添加参数的对话框
        showDialog(){
            this.addParamsDialogVisible=true
        },
        //监听对话框关闭事件
        addParamsDialogClosed(){
            this.$refs.addParamsFormRef.resetFields()
        },
        //点击按钮添加参数
        addParams(){
            this.$refs.addParamsFormRef.validate(async valid=>{
                if(!valid) return
                const {data:res}=await this.$http.post(`categories/${this.cateid}/attributes`,{attr_name:this.addParamsForm.attr_name,attr_sel:this.activeName})
                if(res.meta.status!==201){
                    return this.$message.error('添加参数失败')
                }
                this.$message.success('添加参数成功')
                this.getparamslist()
                this.addParamsDialogVisible=false
            })
        },
        //显示修改参数的对话框
        async showEditDialog(id){
            const{data:res}= await this.$http.get(`categories/${this.cateid}/attributes/${id}`,{params:{attr_sel:this.activeName}})
             if(res.meta.status!==200){
                    return this.$message.error('获取参数失败')
                }
                this.$message.success('获取参数成功')
                this.editParamsForm=res.data
                this.editParamsDialogVisible=true
            
        },
        //监听对话框关闭事件
        editParamsDialogClosed(){
             this.$refs.editParamsFormRef.resetFields()
        },
        //点击确定提交编辑参数的表单
        editParams(){
            this.$refs.editParamsFormRef.validate(async valid=>{
                if(!valid) return
               const{data:res}=await this.$http.put(`categories/${this.cateid}/attributes/${this.editParamsForm.attr_id}`,{attr_name:this.editParamsForm.attr_name,attr_sel:this.activeName})
                if(res.meta.status!==200){
                    return this.$message.error('修改参数失败')
                }
                this.$message.success('修改参数成功')
                this.getparamslist()
                this.editParamsDialogVisible=false
            })
        },
        //显示删除对话框
        async showRemoveDialog(id){
            const confirmres= await this.$confirm(
                '是否要删除该参数？','提示',
                {
                    confirmButtonText:'确定',
                    cancelButtonText:'取消',
                    type :'warning'
                }
                ).catch(err=>err)
                //根据用户点击的按钮判断是否删除用户
                if(confirmres!=='confirm'){
                return  this.$message.info('已经取消删除操作')
                }
                const {data:res}= await this.$http.delete(`categories/${this.cateid}/attributes/${id}`)
                if(res.meta.status!==200) return this.$message.error('删除分类失败')
                this.$message.success('删除分类成功')
                this.getparamslist()
        },
        //将对attr_vals的操作保存到数据库
        async setAttrVals(row){
            //发起请求上传到数据库
            const{data:res}=await this.$http.put(`categories/${this.cateid}/attributes/${row.attr_id}`,{
                attr_name:row.attr_name,
                attr_sel:row.attr_sel,
                attr_vals:row.attr_vals.join(',')
            })
            if(res.meta.status!==200) return this.$message.error('修改参数项失败')
            this.$message.success('修改参数项成功')
        },
        //文本框失去焦点或按下enter触发
         handleInputConfirm(row){
            //如果输入的是空格或不输入就直接返回
            if(row.inputValue.trim().length===0){
                row.inputValue=''
                row.inputVisible=false
                return 
            }
            //如果输入的是合法内容 则添加到tag标签中
            row.attr_vals.push(row.inputValue.trim())
            this.setAttrVals(row)
            row.inputValue=''
            row.inputVisible=false
           
        },
        //点击tag的删除时函数
        handleClose(i,row){
            row.attr_vals.splice(i,1)
            this.setAttrVals(row)
        },
        //显示文本输入框
        showInput(row){
            row.inputVisible=true
            //文本框自动获取焦点
            //$nextTick方法 当页面的元素被重新渲染时执行回调函数
            this.$nextTick(_=>{
                this.$refs.saveTagInput.$refs.input.focus()
            })
        }


    
    },
    computed:{
        isBtnDiabled(){
            if(this.selectedKeys.length!==3){
                return true
            }
            return false
        },
        cateid(){
            if(this.selectedKeys.length===3){
                return this.selectedKeys[2]
            }
            return null
        },
        //动态计算标题的文本
        titleText(){
            if(this.activeName==='many'){
                return '动态参数'
            }
            return '静态属性'
        }
    }
}

</script>
<style lang='less' scoped>
.cat_opt{
    margin-top:15px;
}
.el-cascader{
    margin-left:10px !important;
}
.el-tag{
    margin: 5px;
}
.input-new-tag{
    width: 90px !important;
}
</style>
