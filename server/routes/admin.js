/**
 * Created by chenmeng on 2017/2/17.
 */
let express = require('express');
let router = express.Router();
let path = require('path')
let User = require('../schema/schema').User
let Article = require('../schema/schema').Article;

// 获取后台主页
router.use('/', function (req, res, next) {
    let user = req.session.user;
    if (user && !!user.isAdmin) {
        next()
    } else {
        res.redirect('/');
    }
})


router.get('/', function (req, res) {
    res.sendFile(path.resolve('app/admin/admin.html'))
})
// 获取用户列表
router.get('/user', function (req, res) {
    let pageNum = isNaN(req.query.pageNum) ? 1 : parseInt(req.query.pageNum);
    let pageSize = isNaN(req.query.pageSize) ? 5 : parseInt(req.query.pageSize);

    User.count({}, function (err, count) {
        User.find({}).skip((pageNum - 1) * pageSize).limit(pageSize).exec(function (err, data) {

            if (err) {
                console.log('获取后台数据失败' + err)
            } else {
                let resultData = [];
                if (data && data.length > 0) {
                    data.forEach(function (item, index) {
                        let obj = {};
                        obj.id = item._id;
                        obj.username = item.username;
                        obj.isAdmin = item.isAdmin;
                        resultData.push(obj);
                    })
                    res.send({
                        code: 0,
                        total: Math.ceil(count / pageSize),
                        msg: '获取用户列表成功',
                        data: resultData
                    })
                } else {
                    res.send({
                        code: 1,
                        msg: '当前用户为0',
                        data: {}
                    })
                }
            }
        })
    })
})

// 用户删除
router.post('/user/remove', function (req, res) {
    let id = req.body.id;
    User.remove({_id: id}, function (err, data) {
        if (err) {
            console.log('删除用户出错' + err)
            console.log(err)
        } else {
            res.send({
                code: 0,
                msg: '删除用户成功'
            })
        }
    })
})


// 处理时间转换
function format(date) {
    var date1 = new Date(date);
    return date1.getFullYear() + '年' + toTwo(date1.getMonth() + 1) + '月' + toTwo(date1.getDate()) + '日 ' + toTwo(date1.getHours()) + ':' + toTwo(date1.getMinutes()) + ':' + toTwo(date1.getSeconds());
    function toTwo(n) {
        return n < 10 ? '0' + n : '' + n;
    }
}

//获取文章列表
router.get('/article', function (req, res) {

    let pageNum = isNaN(req.query.pageNum) ? 1 : parseInt(req.query.pageNum);
    let pageSize = isNaN(req.query.pageSize) ? 5 : parseInt(req.query.pageSize);

    Article.count({}, function (err, count) {
        Article.find({}).populate('author').skip((pageNum - 1) * pageSize).limit(pageSize).exec(function (err, data) {

            if (err) {
                console.log('查找文章错误' + err)
            } else {
                if (data && data.length == 0) {
                    res.send({
                        code: 1,
                        msg: '暂无文章信息'
                    })
                } else {
                    var result = [];
                    data.map(function (item, index) {
                        var dataObj = {};
                        dataObj.id = item._id;
                        dataObj.title = item.title;
                        dataObj.category = item.category;
                        dataObj.author = item.author.username;
                        dataObj.addTime = format(item.addTime);
                        result.push(dataObj);
                    })
                    res.send({
                        code: 0,
                        total: Math.ceil(count / pageSize),
                        msg: '获取文章列表成功',
                        data: result
                    })
                }
            }
        })
    })
})


/*    Article.find({}).populate('author').exec(function (err, data) {
 if (err) {
 console.log('查找文章错误' + err)
 } else {
 if (data && data.length == 0) {
 res.send({
 code: 1,
 msg: '暂无文章信息'
 })
 } else {
 var result = [];
 data.map(function (item, index) {
 var dataObj = {};
 dataObj.id = item._id;
 dataObj.title = item.title;
 dataObj.category = item.category;
 dataObj.author = item.author.username;
 dataObj.addTime = format(item.addTime);
 result.push(dataObj);
 })
 res.send({
 code: 0,
 msg: '获取文章列表成功',
 data: result
 })
 }
 }
 })
 })*/

// 提交文章
router.post('/article/add', function (req, res) {
    let article = req.body;
    article.author = req.session.user._id;
    article.addTime = new Date();
    Article.create(article, function (err, result) {
        res.send({
            code: 0,
            msg: '提交成功'
        })
    })
})

// 获取指定文章页
router.get('/article/:aid', function (req, res) {
    let articleId = req.params.aid;
    Article.findOne({_id: articleId}, function (err, data) {
        if (err) {
            console.log('获取指定文章页失败')
            console.log(err)
        } else {
            data.addTime = format(data.addTime)
            res.send({
                code: 0,
                msg: '获取指定文章页成功',
                data
            })
        }
    })

})

// 更新文章
router.post('/article/:aid', function (req, res) {
    let articleId = req.params.aid;
    let article = req.body;
    Article.update({_id: articleId}, article, function (err, data) {
        if (err) {
            console.log('更新文章失败')
            console.log(err)
        } else {
            res.send({
                code: 0,
                msg: '更新文章成功'
            })
        }
    })
})
// 文章删除
router.delete('/article/:aid', function (req, res) {
    let articleId = req.params.aid;
    Article.remove({_id: articleId}, function (err, data) {
        if (err) {
            console.log('删除文章失败')
            console.log(err)
        } else {
            res.send({
                code: 0,
                msg: '删除文章成功'
            })
        }
    })
})


// 用户退出

router.get('/logout', function (req, res) {
    if (req.session.user) {
        req.session.user = null;
        res.send({
            code: 0,
            msg: '退出成功',
        })
    } else {
        res.send({
            code: 1,
            msg: '退出失败'
        })
    }
})


module.exports = router;