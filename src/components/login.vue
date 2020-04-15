<template>
    <!-- 登录页面背景 -->
    <div class="login_container">
        <!-- 登录白色框 -->
        <div class="login_box">
            <!-- 登录框的头像区域 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 登录框的输入区域  登录表单区域-->
            <el-form class="login_form" ref="loginFormref" :model="login_info" :rules="loginrules">
                <!-- 登录输入框 -->
                <el-form-item  prop="username">
                    <el-input v-model="login_info.username"  prefix-icon="iconfont icon-user"></el-input>
                </el-form-item>
                <!-- 密码输入框 -->
                <el-form-item prop="password">
                    <el-input type="password"  v-model="login_info.password" prefix-icon="iconfont icon-3702mima"></el-input>
                </el-form-item>
                <!-- 按钮区域 -->
                 <el-form-item class="btns">
                   <el-button type="primary" @click="login">登录</el-button>
                   <el-button type="info" @click="reset">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script>
export default {
    data(){
        return{
            login_info:{
                username:'admin',
                password:'123456'
            },
            //验证规则对象
            loginrules:{
                username:[
                    { required: true, message: '请输入用户名称', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
            ],
                password:[
                     { required: true, message: '请输入登录密码', trigger: 'blur' },
                    { min: 6, max: 10, message: '长度在 6 到 10 个字符', trigger: 'blur' }
                ]
            }
        }
    },
    methods:{
        reset(){
            this.$refs.loginFormref.resetFields()
        },
        login(){
            //登录预验证
           this.$refs.loginFormref.validate(async valid=>{
                if(!valid) return
                // 发起登录请求
               const {data:res}=await this.$http.post('login', this.login_info)
               if(res.meta.status!==200) return this.$message.error('登录失败')
                this.$message.success('登录成功')
                /*
                    登录成功后，把token写入sessionStorage保存登录状态
                    并使用编程式导航跳转到后台页面 路由是home
                */
                window.sessionStorage.setItem('token',res.data.token)
                this.$router.push('/home')
            })
        }
    }
}
</script>
<style lang="less" scoped>
.login_container{
    height: 100%;
    background-color: #2b4b6b;
}
.login_box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 5px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
}
.avatar_box{
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0,0,10px,#ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%,-50%);
    background-color: #fff;
    img{
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
    }
}

.login_form{
    position: absolute;
    width: 100%;
    bottom: 0;
    box-sizing: border-box;
    padding: 20px;
}
.btns{
    display: flex;
    justify-content: flex-end; 
}
</style>