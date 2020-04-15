<template>
    <el-container class="el_container">
        <!-- 头部区域 -->
        <el-header class="el_header">
            <div>
                <img src="../assets/1.jpg" alt="">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>

        <!-- 页面主体区域 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="isCollapse ? '64px':'200px'" class="el_aside">
                <!-- 折叠按钮 -->
                <div class="toggle_button" @click="zhedie">
                        |||
                </div>
                <!-- 侧边栏菜单区域 -->
                <el-menu :router="true" background-color="#333744" text-color="#fff" active-text-color="#409eff" 
                unique-opened :collapse='isCollapse' :collapse-transition="false" :default-active="activepath">
                    <!-- submenu 是一级菜单 -->
                    <el-submenu :index="item.id+''" v-for="item in menulist" :key=item.id>
                        <!-- template是一级菜单的模板区域 -->
                        <template slot="title">
                            <!-- i是菜单的图标 -->
                            <i :class="iconobj[item.id]"></i>
                            <span>{{item.authName}}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <el-menu-item   @click="saveNavState('/'+subitem.path)" :index="'/'+subitem.path" 
                        v-for="subitem in item.children" :key=subitem.id>
                            <template slot="title">
                            <!-- i是菜单的图标 -->
                            <i class="el-icon-menu"></i>
                            <span>{{subitem.authName}}</span>
                        </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 右侧内容区 -->
            <el-main class="el_main">
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>
<script>
export default {
    data(){
        return{
            menulist:[],
            iconobj:{
                '125':'iconfont icon-user',
                '103':'iconfont icon-tijikongjian',
                '101':'iconfont icon-shangpin',
                '102':'iconfont icon-danju',
                '145':'iconfont icon-baobiao'
            },
            //是否折叠
            'isCollapse':false,
            //被激活的链接地址
            activepath:''
            
        }
    },
    created(){
        this.getMenuList()
        this.activepath=window.sessionStorage.getItem('activepath')
    },
    methods:{
        logout(){
            //清空token
            window.sessionStorage.clear()
            //跳转到登录页
            this.$router.push('/login')
        },
        //获取左侧菜单的数据
        async getMenuList(){
            const {data:res} = await this.$http.get('menus')
            if(res.meta.status!==200) return this.$message.error(res.meta.msg)
            this.menulist=res.data
        },
        //点击按钮进行菜单栏的折叠和展开
        zhedie(){
            this.isCollapse=!this.isCollapse
          
        },
        //保存链接的激活状态
        saveNavState(activepath){
            window.sessionStorage.setItem('activepath',activepath)
            this.activepath=activepath
        }
    }
}
</script>
<style lang="less" scoped>
.el_container{
    height: 100%;
}
.el_header{
    background-color: #373d41;
    display: flex;
    justify-content:space-between ;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
    >div{
        display: flex;
        align-items: center;
        span{
            margin-left: 15px;
        }
    }
    img{
        width:61px;
         height:56px;
          border-radius:50%;
    }
}
.el_aside{
    background-color: #333744;
    .el-menu{
        border-right: 0;
    }
}
.el_main{
    background-color: #eaedf1;
}
.iconfont{
    margin-right:10px;
}
.toggle_button{
    background-color: #4a5064;
    font-size: 10px;
    color: #fff;
    line-height: 24px;
    letter-spacing: 0.2em;
    text-align: center;
    cursor: pointer;
}
</style>