import Vue from 'vue'
import VueRouter from 'vue-router'
// 路由懒加载
// import Login from '../components/login.vue'
// import Home from '../components/home.vue'
// import Welcome from '../components/welcome.vue'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/login.vue')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/home.vue')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/welcome.vue')

// import Users from '../components/user/users.vue'
// import Rights from '../components/power/rights.vue'
// import Roles from '../components/power/roles.vue'
const Users = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/user/users.vue')
const Rights = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/power/rights.vue')
const Roles = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/power/roles.vue')

// import Cate from '../components/goods/categories.vue'
// import Params from '../components/goods/params.vue'
const Cate = () => import(/* webpackChunkName: "cate_params" */ '../components/goods/categories.vue')
const Params = () => import(/* webpackChunkName: "cate_params" */ '../components/goods/params.vue')

// import GoodsList from '../components/goods/list.vue'
// import Add from '../components/goods/addGoods.vue'
const GoodsList = () => import(/* webpackChunkName: "goodslist_add" */ '../components/goods/list.vue')
const Add = () => import(/* webpackChunkName: "goodslist_add" */ '../components/goods/addGoods.vue')


// import Order from '../components/order/order.vue'
// import Report from '../components/report/report.vue'
const Order = () => import(/* webpackChunkName: "order_report" */ '../components/order/order.vue')
const Report = () => import(/* webpackChunkName: "goodslist_add" */ '../components/report/report.vue')

Vue.use(VueRouter)

const routes = [
        {path:'/',redirect:'/login'},
        {path:'/login',component:Login},
        {path:'/home',
            component:Home,
            redirect:'/welcome',
            children:[
                {path:'/welcome',component:Welcome},
                {path:'/users',component:Users},
                {path:'/rights',component:Rights},
                {path:'/roles',component:Roles},
                {path:'/categories',component:Cate},
                {path:'/params',component:Params},
                {path:'/goods',component:GoodsList},
                {path:'/goods/add',component:Add},
                {path:'/orders',component:Order},
                {path:'/reports',component:Report}
            ]
}
]

const router = new VueRouter({
  routes
})
router.beforeEach((to,form,next)=>{
	//如果用户访问的是登录页，直接跳转
	if(to.path==='/login') return next()
	//从sessionStorage中获取token
	const tokenStr=window.sessionStorage.getItem('token')
	//如果token不存在 强制跳转到登录界面
	if(!tokenStr)return next('/login')
	next()
})
export default router
