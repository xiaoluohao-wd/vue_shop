<template>
  <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb class="el_breadcrumb" separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>用户管理</el-breadcrumb-item>
          <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图区域 -->
      <el-card>
          <!-- 搜索与添加区域 -->
          <el-row :gutter="20">
              <el-col :span="7"> 
                <el-input placeholder="请输入内容"  v-model="queryinfo.query" class="input-with-select" clearable @clear="getUserlist">
                  <el-button slot="append" icon="el-icon-search" @click="getUserlist"></el-button>
                </el-input>
              </el-col>
              <el-col :span="4">
                  <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
              </el-col>
          </el-row>
          <!-- 用户列表区域 -->
          <el-table :data="userlist" style="width: 100%" border stripe>
            <el-table-column type="index" label="#"></el-table-column>
              <el-table-column prop="username" label="姓名" width="180"></el-table-column>
              <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
              <el-table-column prop="mobile" label="电话" width="180"></el-table-column>
              <el-table-column prop="role_name" label="角色" width="180"></el-table-column>
              <el-table-column label="状态" width="180">
                  <template slot-scope="scope">
                    <el-switch @change="userStateChange(scope.row)" v-model="scope.row.mg_state"></el-switch>
                  </template>
              </el-table-column>
              <el-table-column label="操作" width="180">
                <template slot-scope="scope">
                  <!-- 修改按钮 -->
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                  <!-- 删除按钮 -->
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserbyid(scope.row.id)"></el-button>
                  <!-- 设置权限按钮 -->
                  <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                    <el-button type="warning" icon="el-icon-setting" size="mini" @click="setrole(scope.row)" ></el-button>
                  </el-tooltip>          
                </template>
              </el-table-column>
            </el-table>
          <!-- 分页区域 -->
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
      <!-- 添加用户对话框 -->
      <el-dialog
          title="添加用户"
          :visible.sync="addDialogVisible"
          width="50%" @close="addDialogClosed">
          <!-- 内容主体区域 -->
          <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="addForm.username"></el-input>
            </el-form-item>
             <el-form-item label="密码" prop="password">
              <el-input v-model="addForm.password"></el-input>
            </el-form-item>
             <el-form-item label="邮箱" prop="email">
              <el-input v-model="addForm.email"></el-input>
            </el-form-item>
             <el-form-item label="手机" prop="mobile">
              <el-input v-model="addForm.mobile"></el-input>
            </el-form-item>
          </el-form>  
          <!-- 底部区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="adduser">确 定</el-button>
          </span>
      </el-dialog>
      <!-- 修改用户的对话框 -->
      <el-dialog
          title="修改用户"
          :visible.sync="EditDialogVisible"
          width="50%" @close="editDialogClosed">
          <!-- 修改用户主体区域 -->
          <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
            <el-form-item label="用户名">
              <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
             <el-form-item label="邮箱" prop="email">
              <el-input v-model="editForm.email"></el-input>
            </el-form-item>
             <el-form-item label="手机" prop="mobile">
              <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>
          </el-form>  
          <!-- 底部区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="EditDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editUserinfo">确定</el-button>
          </span>
      </el-dialog>
      <!-- 分配角色对话框 -->
          <el-dialog
          title="分配角色"
          :visible.sync="setRoleDialogVisible"
          width="50%" @closed="setDialogRoleClosed">
          <!-- 内容主体区域 -->
            <div>
              <p>当前的用户:{{userinfo.username}}</p>
              <p>当前的角色:{{userinfo.role_name}}</p>
              <p>
                分配新角色:
                <el-select v-model="selectroleID" placeholder="请选择">
                    <el-option v-for="item in rolelist" 
                    :key="item.id" :label="item.roleName" 
                    :value="item.id"></el-option>
                </el-select>
              </p>
            </div>
          <!-- 底部区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="setRoleDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveroleinfo">确 定</el-button>
          </span>
      </el-dialog>
  </div>
</template>

<script>
export default {
  created(){
    this.getUserlist()
  },
  data () {
    //验证邮箱的规则
    var checkEmail=(rule,value,cb)=>{
      const regEmail=/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if(regEmail.test(value)){
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    //验证手机的规则
    var checkMobile=(rule,value,cb)=>{
      const regMobile=/^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if(regMobile.test(value)){
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      //获取用户列表的参数对象
      queryinfo:{
        query:'',
        //当前的页数
        pagenum:1,
        //当前每页显示多少条数据
        pagesize:2
      },
      total:0,
      userlist:[],
      //控制添加用户对话框的显示与隐藏
      addDialogVisible:false,
      //添加用户的表达数据
      addForm:{
        username:'',
        password:'',
        email:'',
        mobile:''
      },
      addFormRules:{
        username:[
          {required:true, message:'请输入用户名',trigger:'blur' },
          {min:3, max:10, message:'用户名长度在3-10个字符',trigger:'blur'}
        ],
        password:[
          {required:true, message:'请输入密码',trigger:'blur' },
          {min:6, max:15, message:'密码长度在6-15个字符',trigger:'blur'}
        ],
        email:[
          {required:true, message:'请输入邮箱',trigger:'blur' },
          {validator:checkEmail,trigger:'blur'}
        ],
        mobile:[
          {required:true, message:'请输入手机号',trigger:'blur' },
          {validator:checkMobile,trigger:'blur'}
          
        ]
      },
      //控制修改用户对话框的显示与隐藏
      EditDialogVisible:false,
      //查询用户的信息
      editForm:{},
      //修改用户信息的校验规则
      editFormRules:{
        email:[
          {required:true, message:'请输入邮箱',trigger:'blur' },
          {validator:checkEmail,trigger:'blur'}
        ],
        mobile:[
          {required:true, message:'请输入手机号',trigger:'blur' },
          {validator:checkMobile,trigger:'blur'}
        ]
      },
      //控制分配角色对话框的显示与隐藏
      setRoleDialogVisible:false,
      //需要被分配角色的用户信息
      userinfo:{},
      //角色数据列表
      rolelist:[],
      //已经选择的id
      selectroleID:''
    }

  },

  methods: {
    async getUserlist(){
        const{data:res}=await this.$http.get('users',{params:this.queryinfo})
        if(res.meta.status!==200) return this.$message.error('获取用户列表失败')
        this.userlist=res.data.users
        this.total=res.data.total
    },
    // 监听每页显示的数目变化
    handleSizeChange(newsize){
        this.queryinfo.pagesize=newsize
        this.getUserlist()
    },
    //监听页码值的变化
    handleCurrentChange(newpage){
        this.queryinfo.pagenum=newpage
        this.getUserlist()
    },
    //监听switch开关状态的改变
    async userStateChange(userinfo){
        console.log(userinfo.id)
        const{data:res}= await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
        console.log(res)
        if(res.meta.status!==200) {
          userinfo.mg_state=!userinfo.mg_state
          return this.$message.error('用户状态修改失败')
        }
        this.$message.success('用户状态修改成功')
    },
    //添加用户对话框的关闭事件
    addDialogClosed(){
        this.$refs.addFormRef.resetFields()
    },
    //点击按钮添加用户
    adduser(){
        this.$refs.addFormRef.validate(async valid=>{
          if(!valid) return
          //发起添加用户的请求
          const {data:res}=  await this.$http.post('users',this.addForm)
          if(res.meta.status!==201){
            return this.$message.error('添加用户失败')
          }
          this.$message.success('用户添加成功')
          this.addDialogVisible=false
          this.getUserlist()
        })
    },
    //展示编辑用户的对话框 
    async showEditDialog(id){
      this.EditDialogVisible=true
      const {data:res} =await this.$http.get(`users/${id}`)
      if(res.meta.status!==200){
        return this.$message.error('查询用户信息失败')
      }
      this.editForm=res.data
    },
    //监听修改用户对话框的关闭事件
    editDialogClosed(){
        this.$refs.editFormRef.resetFields()
    },
    //修改用户信息并提交
    editUserinfo(){
      this.$refs.editFormRef.validate(async valid=>{
        if(!valid) return
        //发起网络请求修改用户信息
        const {data:res}=await this.$http.put(`users/${this.editForm.id}`,{email:this.editForm.email,mobile:this.editForm.mobile})
        if(res.meta.status!==200){
          return this.$message.error('修改用户信息失败')
        }
        this.$message.success('更新用户信息成功')
        this.EditDialogVisible=false
        this.getUserlist()
      })
    },
    //根据用户id删除用户
    async removeUserbyid(id){
        const confirmres= await this.$confirm(
          '是否要删除该用户？','提示',
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
        const {data:res}= await this.$http.delete(`users/${id}`)
        if(res.meta.status!==200) return this.$message.error('删除用户失败')
        this.$message.success('删除用户成功')
        this.getUserlist()
    },
    //分配角色的函数
    async setrole(userinfo){
      this.setRoleDialogVisible=true
      this.userinfo=userinfo

      //获取所以角色的列表
      const {data:res}=await this.$http.get('/roles')
      if(res.meta.status!==200){
        return this.$message.error('获取角色列表失败')
      }
      this.rolelist=res.data

    },
    //点击按钮分配角色
    async saveroleinfo(){
      if(!this.selectroleID){
        return this.$message.error('请选择要分配的角色')
      }
      
      const {data:res}=await this.$http.put(`users/${this.userinfo.id}/role`,{rid:this.selectroleID})
      if(res.meta.status!==200){
       
        return this.$message.error('更新角色失败')
      }
      this.$message.success('更新角色成功')
      this.getUserlist()
      this.setRoleDialogVisible=false
    },
    setDialogRoleClosed(){
      this.selectroleID=''
      this.userinfo=''
    }   
  }
}

</script>
<style lang='less' scoped>
</style>
