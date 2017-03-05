/**
 * Created by chenmeng on 2017/2/16.
 */

// 全局指令
// markdown语法转换
Vue.directive('compiledMarkdown', {
    bind: function (el) {
        el.innerHTML = marked(el.innerText);
    }
});

// 日期格式转换
Vue.directive('format', {
    bind: function (el) {
        var date1 = new Date(el.innerHTML);
        el.innerHTML = date1.getFullYear() + '年' + toTwo(date1.getMonth() + 1) + '月' + toTwo(date1.getDate()) + '日 ' + toTwo(date1.getHours()) + ':' + toTwo(date1.getMinutes()) + ':' + toTwo(date1.getSeconds());
        function toTwo(n) {
            return n < 10 ? '0' + n : '' + n;
        }
    }
})

// 全局分页组件
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
    mounted(){
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

// 同级组件数据交互
var bus = new Vue()

// 首页
var index = {
    template: $('#index').html(),
    data(){
        return {
            articleList: [],
            categoryObj: {},
            keyword: '',
            readRanking: [],
            page: {
                current: 1,//当前页
                total: 8,//总页数
                pageSize: 4//每页数据
            }
        }
    },
    created(){
        var _this = this;
        var getData = {
            init(){
                this.getArticle();
                this.getReadRank();
                this.getCategory();
            },
            getArticle(){
                $.ajax({
                    url: '/article?pageNum=' + _this.page.current + '&pageSize=' + _this.page.pageSize,
                    dataType: 'json',
                    success(result){
                        if (result && result.code == 0) {
                            _this.page.total = result.total;
                            _this.articleList = result.data;
                        }
                    }
                })
            },
            getCategory(){
                $.ajax({
                    url: '/articleCategory',
                    dataType: 'json',
                    success(result){
                        if (result && result.code == 0) {
                            var obj = {}
                            var categoryList = result.data;
                            for (var i = 0; i < categoryList.length; i++) {
                                var cur = categoryList[i];
                                if (obj[cur]) {
                                    obj[cur]++;
                                } else {
                                    obj[cur] = 1;
                                }
                            }
                            _this.categoryObj = obj;
                        }
                    }
                })
            },
            getReadRank(){
                $.ajax({
                    url: '/articleRanking',
                    type: 'get',
                    dataType: 'json',
                    success(result){
                        if (result && result.code == 0) {
                            _this.readRanking = result.data;
                        }
                    }
                })
            }
        }
        getData.init();
    },
    methods: {
        subData(obj){
            this.page.current = obj.current;
            this.page.total = obj.total;
            this.page.current = obj.current;
            this.getData();
        },
        getData(){
            var _this = this;
            $.ajax({
                url: '/article?pageNum=' + this.page.current + '&pageSize=' + this.page.pageSize + '&keyword=' + this.keyword,
                dataType: 'json',
                success(data){
                    if (data && data.code == 0) {
                        _this.page.total = data.total;
                        _this.articleList = data.data;
                    }
                }
            })
        },
        search(){
            var _this = this;
            $.ajax({
                url: '/article?keyword=' + this.keyword + '&pageNum=' + this.page.current + '&pageSize=' + this.page.pageSize,
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
}

// 注册
var register = {
    template: $('#register').html(),
    data(){
        return {
            username: '',
            password: '',
            errInfo: ''
        }
    },
    methods: {
        registerSubmit(){
            var _this = this;
            if (this.checkUserName && this.checkPassword) {
                $.ajax({
                        url: '/user/register',
                        type: 'post',
                        data: {
                            username: this.username,
                            password: this.password
                        },
                        success(result){
                            if (result && result.code == 1) {
                                _this.errInfo = result.msg;
                            }
                            ;
                            if (result && result.code == 0) {
                                _this.$router.push({path: '/user/login'});
                            }
                        }
                    }
                )
            }
        }
    },
    computed: {
        checkUserName()
        {
            return /^[a-zA-Z]\w{3,15}$/.test(this.username)
        }
        ,
        checkPassword()
        {
            return /^[a-zA-Z]\w{5,15}$/.test(this.password)
        }
    }
}
// 登录
var login = {
    template: $('#login').html(),
    data(){
        return {
            user: {}
        }
    },
    methods: {
        loginSubmit(){
            var _this = this;
            if (!$.isEmptyObject(this.user)) {
                $.ajax({
                    url: '/user/login',
                    dataType: 'json',
                    data: this.user,
                    type: 'post',
                    success(result){
                        if (result && result.code == 0) {
                            bus.$emit('loginData', result.data)
                            _this.$router.push({path: '/'});
                        }
                    }
                })
            }
        }
    }
}

// 文章列表页
var articleList = {
    template: $('#acticleList').html(),
    data(){
        return {
            articleList: [],
            page: {
                current: 1,//当前页
                total: 100,//总页数
                pageSize: 4//每页数据
            }
        }
    },
    created(){
        var _this = this;
        $.ajax({
            url: '/article?pageNum=' + this.page.current + '&pageSize=' + this.page.pageSize,
            dataType: 'json',
            success(result){
                if (result && result.code == 0) {
                    _this.page.total = result.total;
                    _this.articleList = result.data;
                }
            }
        })
    },
    methods: {
        subData(obj){
            this.page.current = obj.current;
            this.page.total = obj.total;
            this.page.pageSize = obj.pageSize;
            this.getData();
        },
        getData(){
            var _this = this;
            $.ajax({
                url: '/article?pageNum=' + this.page.current + '&pageSize=' + this.page.pageSize,
                dataType: 'json',
                success(data){
                    if (data && data.code == 0) {
                        _this.page.total = data.total;
                        _this.articleList = data.data;
                    }
                }
            })
        }
    }

}

// 文章详情页
var articleDetail = {
    template: $('#articleDetail').html(),
    data(){
        return {
            articleObject: {},
            comment: '',
            username: '',
            reviewer: {
                flag: false,
                login: false
            },
            // 分页评论
            reviews: [],
            page: {
                current: 1,//当前页
                total: 8,//总页数
                pageSize: 4//每页数据
            }
        }
    },
    created(){
        var user = this.getUser();
        if (user) {
            this.username = user
            this.reviewer.login = true;
        } else {
            this.reviewer.login = false;
        }
        var _this = this;
        $.ajax({
            url: this.$route.path,
            type: 'get',
            success(result){
                if (result && result.code == 0) {
                    result.data.content = marked(result.data.content);
                    result.data.addTime = _this.format(result.data.addTime)
                    _this.page.total = Math.ceil(result.data.comments.length / _this.page.pageSize);
                    _this.articleObject = result.data;

                    var arr = _this.articleObject.comments;
                    var length = Math.min(_this.page.pageSize, arr.length - (_this.page.pageSize * (_this.page.current - 1)))
                    var i = (_this.page.current - 1) * _this.page.pageSize;
                    while (length--) {
                        _this.reviews.push(arr[i])
                        i++;
                    }
                }
            }
        })
    },
    methods: {
        format(date){
            var date1 = new Date(date);
            return date1.getFullYear() + '年' + toTwo(date1.getMonth() + 1) + '月' + toTwo(date1.getDate()) + '日 ' + toTwo(date1.getHours()) + ':' + toTwo(date1.getMinutes()) + ':' + toTwo(date1.getSeconds());
            function toTwo(n) {
                return n < 10 ? '0' + n : '' + n;
            }
        },
        submitViews(){
            var _this = this;
            if (this.comment == '') {
                this.reviewer.flag = true;
                return false;
            }
            if (!this.reviewer.login) {
                return false;
            }
            var comment = this.comment,
                username = this.getUser(),
                date = new Date().toLocaleString();
            $.ajax({
                url: window.location.hash.slice(1),
                type: 'post',
                data: {
                    comment,
                    username,
                    date
                },
                success(result){
                    _this.reviewer.flag = false;
                    _this.comment = '';
                    _this.articleObject.comments.push({comment, username, date})
                    _this.page.total = Math.ceil(_this.articleObject.comments.length / _this.page.pageSize);
                    _this.getData();
                }
            })
        },
        cancel(){
            this.comment = '';
            this.reviewer.flag = false;
        },
        getUser(){
            if (localStorage && localStorage.getItem('user')) {
                var user = JSON.parse(localStorage.getItem('user'));
                return user.username;
            }
        },
        subData(obj){
            // 当前页
            this.page.current = obj.current;
            // 总数
            this.page.total = obj.total;

            // 每页显示数
            this.page.pageSize = obj.pageSize;
            this.getData();
        },
        getData(){
            this.reviews = [];
            var arr = this.articleObject.comments;
            var length = Math.min(this.page.pageSize, arr.length - (this.page.pageSize * (this.page.current - 1)))
            var i = (this.page.current - 1) * this.page.pageSize;
            while (length--) {
                this.reviews.push(arr[i])
                i++
            }
        }
    }
}

var about = {
    template: $('#about').html()
}

// 路由
var routes = [
    {
        path: '/',
        name: 'index',
        component: index,
    }, {
        path: '/user/register',
        component: register
    }, {
        path: '/user/login',
        component: login
    }, {
        path: '/articleDetail/:aid',
        name: 'articleDetail',
        component: articleDetail
    }, {
        path: '/articleList',
        component: articleList
    }, /*{
     path: '/about',
     component: about
     }*/
]

var router = new VueRouter({
    routes: routes
})
var app = new Vue({
    el: '#app',
    router: router,
    data: {
        username: '',
        flag: false
    },
    methods: {
        loginData(data){
            this.username = data.username;
            this.flag = !this.flag;
        },
        logoutUser()
        {
            var _this = this;
            $.ajax({
                url: '/user/logout',
                dataType: 'json',
                success(result){
                    if (result && result.code == 0) {
                        localStorage.removeItem('user');
                        _this.flag = !_this.flag;
                        _this.username = '';
                        _this.$router.push({'path': '/'})
                    }
                }
            })
        }
    },
    created(){
        var _this = this;

        function getUser() {
            if (localStorage.getItem('user')) {
                var user = JSON.parse(localStorage.getItem('user'))
                _this.username = user.username;
                _this.flag = !this.flag;
            }
            bus.$on('loginData', function (data) {

                localStorage.setItem('user', JSON.stringify(data))
                _this.username = data.username;
                _this.flag = !this.flag;
            });
        }

        getUser();
    }
});