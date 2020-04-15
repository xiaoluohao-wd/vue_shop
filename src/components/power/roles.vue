<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
         <!-- 添加角色列表按钮 -->
        <el-row>
            <el-col>
                <el-button @click="showRoleDialog" type="primary">添加角色</el-button>
            </el-col>
        </el-row>
        <!-- 角色列表区域 -->
        <el-table row-key="id" :data="roleslist" border stripe >
            <el-table-column type="expand" >
                <template slot-scope="scope">
                    <el-row :class="['bdbottom','vcenter',i1==0?'bdtop':'']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
                        <!-- 渲染一级权限 -->
                        <el-col :span="5">
                            <el-tag closable @close="removeRightById(scope.row,item1.id)"> {{item1.authName}}</el-tag>
                            <i class="el-icon-caret-right"></i>
                        </el-col>
                        <!-- 渲染二级和三级权限 -->
                        <el-col :span="19">
                            <!-- 通过for循环渲染二级权限 -->
                            <el-row :class="[i2==0?'':'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id" >
                                <el-col :span="6">
                                    <el-tag closable @close="removeRightById(scope.row,item2.id)" type="success">{{item2.authName}}</el-tag>
                                    <i class="el-icon-caret-right"></i>
                                </el-col>
                                <!-- 通过for循环渲染三级权限 -->
                                <el-col :span="18">
                                    <el-row >
                                        <el-tag closable @close="removeRightById(scope.row,item3.id)" type="warning" v-for="(item3) in item2.children" :key="item3.id">
                                            {{item3.authName}}
                                        </el-tag>
                        
                                    </el-row>
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                </template>    
            </el-table-column> 
            <el-table-column type="index"></el-table-column>
            <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope" width="300px">
                    <el-button type="primary" icon="el-icon-search" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="showRemovedDialog(scope.row.id)">删除</el-button>
                    <el-button type="warning" icon="el-icon-edit" @click="showSetRightDialog(scope.row)" size="mini">分配权限</el-button>     
                </template>
            </el-table-column>
        </el-table>
    </el-card>
    <!-- 分配角色的对话框 -->
    <el-dialog @closed="setrightDialogClosed" title="分配权限" :visible.sync="SetRightDialogVisible" width="50%">
        <el-tree ref="treeref" show-checkbox node-key="id" :default-expand-all="true" :default-checked-keys="defKeys" :data="rightslist" :props="treeprops"></el-tree>
        <span slot="footer" class="dialog-footer">
            <el-button @click="SetRightDialogVisible=false" type="info">取消</el-button>
            <el-button @click="allotRights" type="primary">确定</el-button>
        </span>       
    </el-dialog>

    <!-- 添加角色的对话框 -->
    <el-dialog
        title="添加角色"
        :visible.sync="addRoleDialogVisible"
        width="50%" @close="addDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
            <el-form-item label="角色描述">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
        </el-form>  
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addrole()">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 编辑角色的对话框 -->
    <el-dialog
        title="编辑角色"
        :visible.sync="editRoleDialogVisible"
        width="50%" @close="addDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="editRoleForm" :rules="addRoleFormRules" ref="editRoleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
            <el-form-item label="角色描述">
            <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
        </el-form>  
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editrole()">确 定</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
    created(){
        this.getroleslist()
    },
   data () {
    return {
        id:'000',
        //角色列表
        roleslist:[],
        SetRightDialogVisible:false,
        rightslist:[],

        //树形控件的属性绑定对象
        treeprops:{
            label:'authName',
            children:'children'
        },
        //用户的默认权限
        defKeys:[],
        //用户id
        roleID:'',
        //控制添加角色的对话框的显示
        addRoleDialogVisible:false,
        //添加角色的表单信息
        addRoleForm:{
            roleName:'',
            roleDesc:''
        },
        //添加角色的校验规则
        addRoleFormRules:{
            roleName:[
                {required:true, message:'请输入角色名称',trigger:'blur' },
            ]
        },
        //控制编辑角色的对话框的显示
        editRoleDialogVisible:false,
        //修改角色信息的表单
        editRoleForm:{
            roleName:'',
            roleDesc:''
        }
    }
   },

   methods: {
    //获取角色列表
    async  getroleslist(){
        const{data:res}=await this.$http.get('roles')
        if(res.meta.status!==200){
            return this.$message.error('获取角色列表失败')
        }
        this.$message.success('获取角色列表成功')
        this.roleslist=res.data
      },
      //根据id删除权限
     async removeRightById(role,id){
        const confirmres= await this.$confirm(
          '是否要删除该权限？','提示',
          {
            confirmButtonText:'确定',
            cancelButtonText:'取消',
            type :'warning'
          }
        ).catch(err=>err)
        if(confirmres!=='confirm'){
            return this.$message.info('已经取消删除操作')
        }
        const {data:res}=await this.$http.delete(`roles/${role.id}/rights/${id}`)
        if(res.meta.status!==200) return this.$message.error('删除权限失败')
        this.$message.success('删除权限成功')
        role.children=res.data
      }  ,
      
    //显示分配权限的对话框
    async showSetRightDialog(role){
        
        this.SetRightDialogVisible=true
        //获取所有权限的数据
      const {data:res}=await this.$http.get('rights/tree')
      if(res.meta.status!==200){
            return this.$message.error('获取权限数据失败')
        }
        this.$message.success('获取权限数据成功')
        this.rightslist=res.data
        this.getleafKey(role,this.defKeys)
        this.roleID=role.id
    },
    //递归获取角色下所以三级权限的id并保存到defkey数组
    getleafKey(node,arr){
        if(!node.children){
            return arr.push(node.id)
        }
        node.children.forEach(item=>this. getleafKey(item,arr))
       
    },
    //监听分配权限对话框的函数
    setrightDialogClosed(){
        this.defKeys=[]
    },
    //提交分配权限的函数
    async allotRights(){
        const keys = [
            ...this.$refs.treeref.getCheckedKeys(),
            ...this.$refs.treeref.getHalfCheckedKeys()
        ]
        const idstr=keys.join(',')
        console.log(keys,idstr)
        const {data:res}=await this.$http.post(`roles/${this.roleID}/rights/`, { rids:idstr } )
        if(res.meta.status!==200){
            console.log(res)
            return this.$message.error('分配权限失败')
        }
        this.$message.success('分配权限成功')
        this.getroleslist()
        this.SetRightDialogVisible=false
    },
    //显示添加角色对话框
    showRoleDialog(){
        this.addRoleDialogVisible=true
    },
    //点击确认添加角色
    addrole(){
       this.$refs.addRoleFormRef.validate(async valid=>{
           if(!valid) return
           const {data:res}=await this.$http.post('roles',this.addRoleForm)
           if(res.meta.status!==201){
               this.$message.error('添加角色失败')
           }
           this.$message.success('添加角色成功')
           this.addRoleDialogVisible=false
           this.getroleslist()
       })
    },
    //添加角色对话框关闭后重置表单
    addDialogClosed(){
        this.addRoleForm={}
    },
    //显示编辑角色对话框
    async showEditDialog(id){
        this.editRoleDialogVisible=true
        const {data:res}=await this.$http.get(`roles/${id}`)
        if(res.meta.status!==200){
            this.$message.error('查询角色失败')
        }
        this.editRoleForm=res.data
    },
    //点击确定修改角色信息
    editrole(){
         this.$refs.editRoleFormRef.validate(async valid=>{
            if(!valid) return
            //发起网络请求修改用户信息
            const {data:res}=await this.$http.put(`roles/${this.editRoleForm.roleId}`,{roleName:this.editRoleForm.roleName,roleDesc:this.editRoleForm.roleDesc})
            if(res.meta.status!==200){
                console.log(res)
                return this.$message.error('修改用户信息失败')
            }
            this.$message.success('更新用户信息成功')
            this.editRoleDialogVisible=false
            this.getroleslist()
        })
    },
    //显示删除角色对话框
    async showRemovedDialog(id){
        const confirmres= await this.$confirm(
          '是否要删除该角色？','提示',
          {
            confirmButtonText:'确定',
            cancelButtonText:'取消',
            type :'warning'
          }
        ).catch(err=>err)
        //根据用户点击的按钮判断是否删除权限
         if(confirmres!=='confirm'){
           return  this.$message.info('已经取消删除操作')
         }
         const {data:res}= await this.$http.delete(`roles/${id}`)
         if(res.meta.status!==200) return this.$message.error('删除角色失败')
         this.$message.success('删除角色成功')
         this.getroleslist()
    }
   }
   
}

</script>
<style lang='less' scoped>
.el-tag{
    margin-bottom: 7px;
}
.bdtop{
       border-top: 1px solid #eee;
}
.bdbottom{
       border-bottom: 1px solid #eee;
}
.vcenter{
    display: flex;
    align-items: center;
}
</style>
