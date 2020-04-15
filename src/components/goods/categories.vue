<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
         <!-- 添加分类列表按钮 -->
        <el-row>
            <el-col>
                <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
            </el-col>
        </el-row>

        <!-- 表格区 -->
        <tree-table class="tree_table" :data="catelist" :columns="columns" 
          :selection-type="false" :expand-type="false" 
          show-index index-text="#" border> 
            <!-- 是否有效 -->
            <template slot="isok" slot-scope="scope">
                <i class="el-icon-success" style="color:lightgreen" v-if="scope.row.cat_deleted===false"></i>
                <i class="el-icon-error" style="color:red" v-else></i>
            </template>
            <!-- 排序 -->
            <template slot="order" slot-scope="scope">
                <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
                <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
                <el-tag type="warning" size="mini" v-else>三级</el-tag>
            </template>
            <!-- 操作 -->
            <template slot="opt" slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="showRemovedDialog(scope.row.cat_id)">删除</el-button>
            </template>
        </tree-table>

        <!-- 分页区 -->
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryinfo.pagenum"
            :page-sizes="[1, 2, 3, 4, 5, 10]"
            :page-size="queryinfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%" @close="addDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name" ></el-input>
        </el-form-item>
            <el-form-item label="父级分类">
                <!-- 级联选择框 options用来指定数据元 props用来指定配置对象 -->
                <el-cascader expand-trigger="hover" :options="parentCateList"
                  :props="cascadeProps" v-model="selectedKeys" 
                  @change="parentCateChange" clearable change-on-select filterable>
                </el-cascader>
            </el-form-item>
        </el-form>  
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate()">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 编辑角色的对话框 -->
    <el-dialog
        title="编辑分类"
        :visible.sync="editCateDialogVisible"
        width="50%" @close="EditDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="editCateForm" :rules="addCateFormRules" ref="editCateFormRef" label-width="80px">
          <el-form-item label="分类名称" prop="cat_name">
              <el-input v-model="editCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>  
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editcate()">确 定</el-button>
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
      //商品分类的列表
      catelist:[],
      //获取商品分类的请求信息
      queryinfo:{
        type:3,
        pagenum:1,
        pagesize:5,        
      },
      //商品分类的个数
      total:0,
      //定义表格列的信息
      columns:[
        {
          label:'分类名称',
          prop:'cat_name'
        },
        {
          label:'是否有效',
          //表示当前这一列是自定义模板列
          type:'template',
          //表示当前这一列使用模板名称
          template:'isok'
        },
        {
          label:'排序',
          type:'template',
          template:'order'
        },
        {
          label:'操作',
          type:'template',
          template:'opt'
        }
      ],
      //控制添加分类表单显示的布尔值
      addCateDialogVisible:false,
      //添加分类的表单信息
      addCateForm:{
          cat_pid:0,
          cat_name:'',
          cat_level:0
      },
      //添加分类的表单校验规则
      addCateFormRules:{
        cat_name:[
          {required:true,message:'请输入分类名称',trigger:'blur'}
        ]
      },
      //父级分类的列表数组
      parentCateList:[],
      //指定级联选择框的配置对象
      cascadeProps:{
        value:'cat_id',
        label:'cat_name',
        children:'children'
      },
      //选择的父级分类的id数组
      selectedKeys:[],
      //控制编辑分类的对话框显示
      editCateDialogVisible:false,
      //编辑分类的表单
      editCateForm:{}
    }

  },

  methods: {
    //获取商品分类的列表
    async getcatelist(){
      const {data:res}=await this.$http.get('/categories',{params:this.queryinfo})
      if(res.meta.status!==200){
        return this.$message.error('获取分类信息失败')
      }
      this.catelist=res.data.result
      this.total=res.data.total
    },
    //监听pagesize改变的函数
    handleSizeChange(newsize){
      this.queryinfo.pagesize=newsize
      this.getcatelist()
    },
    //监听pagenum改变的方法
    handleCurrentChange(newpage){
      this.queryinfo.pagenum=newpage
      this.getcatelist()
    },
    //点击显示添加分类的对话框
    showAddCateDialog(){
        this.getParentCateList()
        this.addCateDialogVisible=true      
        
    },
    //获取父级分类的数据列表
    async getParentCateList(){
        const {data:res}=await this.$http.get('categories',{params:{type:2}})
        if(res.meta.status!==200){
          return this.$message.error('获取父级分类失败')
        }
        this.parentCateList=res.data
    },
    //选择项发生变化时触发函数
    parentCateChange(){
      //如果selectedKeys数组中的length大于0 证明选择父级分类
      if(this.selectedKeys.length>0){
        //为当前分类的id赋值
        this.addCateForm.cat_pid=this.selectedKeys[this.selectedKeys.length-1]
        //为当前分类的等级赋值
        this.addCateForm.cat_level=this.selectedKeys.length
        return
      }else{
           this.addCateForm.cat_pid=0
           this.addCateForm.cat_level=0
      }
    },
    //点击确定添加分类
    addCate(){
      this.$refs.addCateFormRef.validate(async valid=>{
          if(!valid) return 
          const {data:res}=await this.$http.post('categories',this.addCateForm)
          if(res.meta.status!==201){
            return this.$message.error('添加分类失败')
          }
          this.$message.success('添加分类成功')
          this.getcatelist()
          this.addCateDialogVisible=false
      })
    },
    //监听添加分类的对话框关闭时的函数
    addDialogClosed(){
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys=[]
      this.addCateForm.cat_pid=0
      this.addCateForm.cat_leval=0
    },
    //显示编辑分类的对话框
    async showEditDialog(id){
        this.editCateDialogVisible=true
        const {data:res}=await this.$http.get(`categories/${id}`)
        if(res.meta.status!==200){
            this.$message.error('查询角色失败')
        }
        this.editCateForm=res.data
    },
    //点击确定修改角色信息
    editcate(){
         this.$refs.editCateFormRef.validate(async valid=>{
            if(!valid) return
            //发起网络请求修改用户信息
            const {data:res}=await this.$http.put(`categories/${this.editCateForm.cat_id}`,{cat_name:this.editCateForm.cat_name})
            if(res.meta.status!==200){
                console.log(res)
                return this.$message.error('修改分类信息失败')
            }
            this.$message.success('更新分类信息成功')
            this.editCateDialogVisible=false
            this.getcatelist()
        })
    },
    //监听编辑角色的对话框关闭的函数
    EditDialogClosed(){
      this.$refs.editCateFormRef.resetFields()
      this.editCateForm={}
    },
    //显示删除分类的对话框
     async showRemovedDialog(id){
        const confirmres= await this.$confirm(
          '是否要删除该分类？','提示',
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
         const {data:res}= await this.$http.delete(`categories/${id}`)
         if(res.meta.status!==200) return this.$message.error('删除分类失败')
         this.$message.success('删除分类成功')
         this.getcatelist()
    } 
  }
}

</script>
<style lang='less' scoped>
.el-cascader{
  width: 100%;
}
.tree_table{
  margin-top: 15px;
}

</style>
