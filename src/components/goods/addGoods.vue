<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card>
            <!-- 提示区域 -->
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
            <!-- 步骤条 -->
            <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!-- 左侧菜单栏 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
                <el-tabs :before-leave="beforeLeave" 
                    v-model="activeIndex" :tab-position="'left'"
                    @tab-click="tabClicked" style="height">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <!-- 级联选择框 options用来指定数据元 props用来指定配置对象 -->
                            <el-cascader expand-trigger="hover" :options="catelist"
                            :props="cascadeProps" v-model="addForm.goods_cat" 
                            @change="handleChange" clearable size="mini"  change-on-select>
                            </el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <!-- 渲染表单的item项 -->
                        <el-form-item v-for="(item) in manyTableData" :label="item.attr_name" :key="item.attr_id">
                            <!-- 复选框组 -->
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox border :label="cb" v-for="(cb,index) in item.attr_vals" :key="index">
                                </el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <!-- 渲染表单的item项 -->
                        <el-form-item v-for="(item) in onlyTableData" :label="item.attr_name" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <!-- action表示图片要上传到的后台API地址 -->
                        <el-upload :action="uploadUrl"
                           :on-preview="handlePreview" :on-remove="handleRemove" 
                           list-type="picture" :headers="headerobj" :on-success="handleSuccess">
                           <el-button size="small" type="primary">图片上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <!-- 富文本编辑器 -->
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <el-button type="primary" @click="addGoods" class="addbtn">添加商品</el-button>
                    </el-tab-pane>
                   
                </el-tabs>
            </el-form>
            
        </el-card>

        <!-- 图片预览 -->
        <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
            <img :src="previewImgUrl" alt="" class="previewimg">
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
            activeIndex:'0',
            //添加商品的表单信息
            addForm:{
                goods_name:'',
                goods_price:0,
                goods_weight:0,
                goods_number:0,
                goods_cat:[],
                pics:[],
                goods_introduce:'',
                attrs:[]
            },
            addFormRules:{
                goods_name:[
                    {required:true,message:'请输出商品名称',trigger:'blur'}
                ],
                goods_price:[
                    {required:true,message:'请输出商品价格',trigger:'blur'}
                ],
                goods_weight:[
                    {required:true,message:'请输出商品重量',trigger:'blur'}
                ],
                goods_number:[
                    {required:true,message:'请输出商品数量',trigger:'blur'}
                ],
                goods_cat:[
                     {required:true,message:'请选择商品分类',trigger:'blur'}
                ]
            },
            //商品分类列表
            catelist:[],
            cascadeProps:{
                label:'cat_name',
                value:'cat_id',
                children:'children'
            },
            //动态参数列表
            manyTableData:[],
            //静态属性列表
            onlyTableData:[],
            //上传图片的url地址
            uploadUrl:'http://127.0.0.1:8888/api/private/v1/upload',
            //图片上传组件的headers请求头
            headerobj:{
                Authorization:window.sessionStorage.getItem('token')
            },
            //预览图片的路径
            previewImgUrl:'',
            //控制图片预览对话框显示的布尔值
            previewVisible:false
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
        //级联选择框选项变化时触发
        handleChange(){
            if(this.addForm.goods_cat.length!==3){
                this.addForm.goods_cat=[]
            }
        },
        //离开页签触发的函数
        beforeLeave(activeTab,oldTab){
            if(oldTab==='0' && this.addForm.goods_cat.length!==3){
                this.$message.error('请选择商品分类')
                return false
            }
        },
        //点击页签时触发的函数
        async tabClicked(){
            //如果用户访问的是商品参数页签 则需要显示动态参数
            if(this.activeIndex==='1'){
                const {data:res}=await this.$http.get(`categories/${this.cateId}/attributes`,
                {params:{sel:'many'}})
                if(res.meta.status!==200){
                    return this.$message.error('获取动态参数失败')
                }
                this.manyTableData=res.data
                res.data.forEach(item=>{
                   item.attr_vals=item.attr_vals.length===0 ? [] : item.attr_vals.split(',')
                })
            }
            //如果访问的是商品属性页签 则需要显示静态属性
            else if(this.activeIndex==='2'){
                const {data:res}=await this.$http.get(`categories/${this.cateId}/attributes`,
                {params:{sel:'only'}})
                if(res.meta.status!==200){
                    return this.$message.error('获取动态参数失败')
                }
                this.onlyTableData=res.data
           
            }
        },
        //处理图片预览的函数
        handlePreview(file){
            console.log()
            this.previewImgUrl=file.response.data.url
            this.previewVisible=true
        },
        //处理图片删除的函数
        handleRemove(file){
            //获取将要删除的图片的临时路径 从pics中删除这一项
            const filepath=file.response.data.tmp_path
            const i= this.addForm.pics.findIndex(x=>x.pic===filepath)
            this.addForm.pics.splice(i,1)
        },
        //上传图片成功时触发
        handleSuccess(response){
            //拼接一个图片信息对象push到pics数组中
            const picinfo ={pic:response.data.tmp_path}
            this.addForm.pics.push(picinfo)
        },
        //点击按钮添加商品
        addGoods(){
            this.$refs.addFormRef.validate(async valid=>{
                if(!valid) return this.$message.error('请填写必要的商品信息')
                //发起请求向服务器添加商品
                //深拷贝一份商品表单
                const form=_.cloneDeep(this.addForm)
                //修改表单中的cat为字符串
                form.goods_cat=form.goods_cat.join(',')
                //处理动态参数和静态属性
                this.manyTableData.forEach(item=>{
                    const newinfo={attr_id:item.attr_id,attr_value:item.attr_vals.join(' ')}
                    this.addForm.attrs.push(newinfo)
                })
                this.onlyTableData.forEach(item=>{
                    const newinfo={attr_id:item.attr_id,attr_value:item.attr_vals}
                    this.addForm.attrs.push(newinfo)
                })
                form.attrs=this.addForm.attrs
                //商品名称必须唯一
                const {data:res}=await this.$http.post('goods',form)
                console.log(res)
                if(res.meta.status!==201)return this.$message.error(res.meta.msg)
                this.$message.success('商品添加成功')
                this.$router.push('/goods')
            })
        }
    },
    computed:{
        cateId(){
            if(this.addForm.goods_cat.length===3){
                return this.addForm.goods_cat[2]
            }
            return null
        }
    }
}

</script>
<style lang='less' scoped>
.el-checkbox{
    margin: 0 10px 0 0 !important;
}
.previewimg{
    width: 100%;
}
.addbtn{
    margin-top: 10px;
}
</style>
