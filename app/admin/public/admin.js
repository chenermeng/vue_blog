/**
 * Created by chenmeng on 2017/2/18.
 */
// 数据传递
var bus = new Vue()

// 分页组件
/*Vue.component('page', {
 template: $('#page').html(),
 data(){
 return {
 showItem: 5,
 current: 1,
 allPage: 12
 }
 },
 methods: {
 goToPage(index){
 if (index == this.current) return;
 this.current = index;
 }
 },
 computed: {
 pages() {
 // 生成的点击页数按钮
 var page = []
 if (this.current < this.showItem) {
 var i = Math.min(this.allPage, this.showItem)
 while (i) {
 page.unshift(i--);
 }
 } else {
 var begin = this.current - Math.floor(this.showItem / 2);
 var i = this.showItem;
 if (begin > this.allPage - this.showItem) {
 begin = this.allPage - this.showItem + 1;
 }
 while (i--) {
 page.push(begin++);
 }
 }
 return page;
 }
 }
 });*/
Vue.component('page', {
    template: $('#pageTmpl').html(),
    data(){
        return {
            sonCurrent: 1,//当前页
            sonTotal: 8,//总页数
            sonPageSize: 4//每页数据
        }
    },
    watch: {
        total(val){
            this.sonTotal = val;
        },
        current(val){
            this.current = val;
        }, pageSize(val){
            this.pageSize = val;
        }
    },
    props: ['current', 'total', 'pageSize'],
    created(){
        this.sonCurrent = this.current;
        this.sonTotal = this.total;
        this.sonPageSize = this.pageSize;
    },
    methods: {
        emitDate(){
            var _this = this;
            this.$emit('getNewData', {
                current: _this.sonCurrent,//当前页
                total: _this.sonTotal,//总页数
                pageSize: _this.sonPageSize//每页数据
            })
        }
    }
})

// 后台首页
var adminIndex = {
    template: $('#adminIdex').html()
}
// 用户编辑
var userEdit = {
    template: $('#userEdit').html(),
    data(){
        return {
            userList: [],
            page: {
                current: 1,//当前页
                total: 8,//总页数
                pageSize: 4//每页数据
            }
        }
    },
    methods: {
        removeUser(id,isAdmin){
            var _this = this;
            $.ajax({
                url: '/admin/user/remove',
                type: 'post',
                data:{
                    id:id,
                    isAdmin:isAdmin
                },
                success(result){
                    if (result && result.code == 0) {
                        _this.userList = _this.userList.filter(function (item) {
                            return item.id != id;
                        })
                    }
                    if(result && result.code == 1){
                        console.log('不能删除管理员')
                    }
                }
            })
        },
        subData(obj){
            this.page.current = obj.current;
            this.page.total = obj.total;
            this.page.pageSize = obj.pageSize;
            this.getData();
        },
        getData(){
            var _this = this;
            $.ajax({
                url: '/admin/user?pageNum=' + this.page.current + '&pageSize=' + this.page.pageSize,
                dataType: 'json',
                success(data){
                    if (data && data.code == 0) {
                        _this.page.total = data.total;
                        _this.userList = data.data;
                    }
                }
            })
        }
    },
    created(){
        var _this = this;
        $.ajax({
            url: '/admin/user?pageNum=' + this.page.current + '&pageSize=' + this.page.pageSize,
            dataType: 'json',
            success(data){
                if (data && data.code == 0) {
                    _this.page.total = data.total;
                    _this.userList = data.data;
                }
            }
        })
    },
}

//文章编辑
var articleEdit = {
    template: $('#articleEdit').html(),
    data(){
        return {
            article: {}
        }
    },
    methods: {
        update(){
            var _this = this;
            $.ajax({
                url: '/admin/' + this.$route.path,
                type: 'post',
                data: this.article,
                dataType: 'json',
                success(result){
                    if (result && result.code == 0) {
                        _this.$router.push({'path': '/article'})
                    }
                }
            })
        }
    },
    mounted(){
        var _this = this;
        var smde = new SimpleMDE({
            autofocus: true,
            autosave: true,
            previewRender: function (plainText) {
                return marked(plainText, {
                    renderer: new marked.Renderer(),
                    gfm: true,
                    pedantic: false,
                    sanitize: false,
                    tables: true,
                    breaks: true,
                    smartLists: true,
                    smartypants: true,
                    highlight: function (code) {
                        return hljs.highlightAuto(code).value;
                    }
                });
            }
        })
        $.ajax({
            url: '/admin' + _this.$route.path,
            success(result){
                _this.article = result.data;
                smde.value(_this.article.content)
            }
        })
        // 监控内容变化
        smde.codemirror.on("change", function () {
            var value = smde.value();
            _this.article.content = value
        });
    }
}


// 文章首页
var article = {
    template: $('#article').html(),
    data(){
        return {
            articleList: [],
            page: {
                current: 1,//当前页
                total: 8,//总页数
                pageSize: 4//每页数据
            }
        }
    },
    methods: {
        removeArticle(id){
            var _this = this;
            $.ajax({
                url: '/admin/article/' + id,
                type: 'delete',
                success(result){
                    if (result && result.code == 0) {
                        _this.articleList = _this.articleList.filter(function (item) {
                            return item.id != id;
                        })
                    }
                }
            })
        },
        subData(obj){
            this.page.current = obj.current;
            this.page.total = obj.total;
            this.page.current = obj.current;
            this.getData();
        },
        getData(){
            var _this = this;
            $.ajax({
                url: '/admin/article?pageNum=' + this.page.current + '&pageSize=' + this.page.pageSize,
                dataType: 'json',
                success(data){
                    if (data && data.code == 0) {
                        _this.page.total = data.total;
                        _this.articleList = data.data;
                    }
                }
            })
        }
    },
    created(){
        var _this = this;
        $.ajax({
            url: '/admin/article?pageNum=' + this.page.current + '&pageSize=' + this.page.pageSize,
            type: 'get',
            dataType: 'json',
            success(result){
                if (result && result.code == 0) {
                    _this.page.total = result.total;
                    _this.articleList = result.data;
                }
            }
        })
    }
}

// 文章添加
var articleAdd = {
    template: $('#articleAdd').html(),
    data(){
        return {
            article: {
                content: '',
                title: '',
                summary: '',
                category: ''
            }
        }
    },
    methods: {
        publish(){
            var _this = this;
            $.ajax({
                url: '/admin/article/add',
                type: 'post',
                dataType: 'json',
                data: this.article,
                success(result){
                    if (result && result.code == 0) {
                        _this.$router.push({path: '/'});
                    }
                }
            })
        }
    },
    mounted(){
        var _this = this;
        var smde = new SimpleMDE({
            autofocus: true,
            autosave: true,
            previewRender: function (plainText) {
                return marked(plainText, {
                    renderer: new marked.Renderer(),
                    gfm: true,
                    pedantic: false,
                    sanitize: false,
                    tables: true,
                    breaks: true,
                    smartLists: true,
                    smartypants: true,
                    highlight: function (code) {
                        return hljs.highlightAuto(code).value;
                    }
                });
            },
        });
        // 监控内容变化
        smde.codemirror.on("change", function () {
            var value = smde.value();
            _this.article.content = value
        });
    }
}

var routes = [
    {
        path: '/',
        component: adminIndex
    }, {
        path: '/userEdit',
        component: userEdit
    }, {
        path: '/article',
        component: article,
    }, {
        path: '/article/:aid',
        name: 'articleEdit',
        component: articleEdit
    }, {
        path: '/articleAdd',
        component: articleAdd
    }
]
var router = new VueRouter({
    routes
})
var app = new Vue({
    el: '#container',
    router,
    data: {
        user: ''
    },
    created(){
        var user = localStorage.getItem('user')
        if (user) {
            user = JSON.parse(user);
            this.user = user.username;
        }
    },
    methods: {
        logout(){
            var _this = this;
            console.log(323)
            $.ajax({
                url: '/admin/logout',
                success(result){
                    console.log(result)
                    if (result && result.code == 0) {
                        localStorage.removeItem('user');
                      window.location.href='/';
                    }
                }
            })
        }
    }
})