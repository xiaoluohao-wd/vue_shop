import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import '../src/assets/fonts/iconfont.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
//导入富文本编辑器及样式
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

//导入进度条包的js和css
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

//配置axios
Vue.prototype.$http=axios
axios.defaults.baseURL=`http://127.0.0.1:8888/api/private/v1/`
//axios拦截
//在request拦截器中显示进度条 NProgress.start()
axios.interceptors.request.use(config=>{
	//为请求头对象添加token验证的Authorization字段
	NProgress.start()
	config.headers.Authorization=window.sessionStorage.getItem('token')
	return config
})
//在response拦截器隐藏进度条 NProgress.done()
axios.interceptors.response.use(config=>{
	//为请求头对象添加token验证的Authorization字段
	NProgress.done()
	return config
})

//格式化时间的过滤器
Vue.filter('dateFormat',function(originVal){
	const dt= new Date(originVal)
	const y = dt.getFullYear()
	const m = (dt.getMonth() + 1 +'').padStart(2,'0')
	const d = (dt.getDay() +'').padStart(2,'0')
	const h = (dt.getHours() +'').padStart(2,'0')
	const min=(dt.getMinutes() +'').padStart(2,'0')
	const s =(dt.getSeconds() +'').padStart(2,'0')
	return `${y}-${m}-${d} ${h}:${min}:${s}`
})

//定义树形表单组件
Vue.component('tree-table',TreeTable)
//注册富文本组件
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
