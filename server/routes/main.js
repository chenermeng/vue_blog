/**
 * Created by chenmeng on 2017/2/17.
 */
let express = require('express');
let router = express.Router();
let path = require('path');
let fs = require('fs')

let User = require('../schema/schema').User;
let Article = require('../schema/schema').Article;

let md5 = require('md5');

router.get('/', function (req, res) {
    res.sendFile(path.resolve('app/main/index.html'))
})


// 用户注册
router.post('/user/register', function (req, res) {
    let user = req.body;

    User.create(user, function (err, data) {
        if (err) {
            console.log('用户注册' + err)
        } else {
            res.send({
                code: 0,
                msg: '注册成功',
                data: {
                    username: user.username,
                    id: data._id
                }
            })
        }
    })
})
// 用户登录
router.post('/user/login', function (req, res) {
    let user = req.body;
    User.findOne({username: user.username}, function (err, data) {
        if (err) {
            console.log('用户登录' + err)
        } else {
            let result = data && data.username === user.username && data.password === user.password;
            if (result) {
                req.session.user = data;
                res.send({
                    code: 0,
                    msg: '登录成功',
                    data: {
                        username: user.username,
                        id: data._id
                    }
                })
            } else {
                res.send({
                    code: 1,
                    msg: '登录失败,用户名或密码错误'
                })
            }

        }
    })

})
//用户退出
router.get('/user/logout', function (req, res) {
    req.session.user = null;
    res.send({
        code: 0,
        msg: '退出成功'
    })
})


// 获取文章列表
router.get('/article', function (req, res) {
    let pageNum = isNaN(req.query.pageNum) ? 1 : parseInt(req.query.pageNum);
    let pageSize = isNaN(req.query.pageSize) ? 5 : parseInt(req.query.pageSize);


    let keyword = req.query.keyword;
    let search = {};
    let keywordReg = new RegExp(keyword);
    if (keyword) {
        search.$or = [{title: keywordReg}, {content: keywordReg}];
    }

    Article.count(search, function (err, count) {
        Article.find(search).populate('author').skip((pageNum - 1) * pageSize).limit(pageSize).exec(function (err, data) {
            if (err) {
                console.log('查找文章错误' + err)
            } else {
                if (data && data.length > 0) {
                    // console.log('获取文章列表得修改 109行')
                    data = data.map(function (item, index) {
                        item.content = null;
                        return item
                    });
                    res.send({
                        code: 0,
                        msg: '文章列表',
                        total: Math.ceil(count / pageSize),
                        data
                    })
                }
            }
        })
    })
})

// 获取分类
router.get('/articleCategory', function (req, res) {
    Article.find({}, function (err, data) {
        if (err) {
            console.log('分类查找失败')
            console.log(err)
        } else {
            var result = [];
            data.forEach(function (item) {
                result.push(item.category);
            })
            res.send({
                code: '0',
                msg: '获取分类成功',
                data: result
            })
        }
    })
})

// 获取文章详情页
router.get('/articleDetail/:aid', function (req, res) {
    let articleId = req.params.aid;
    Article.findOne({_id: articleId}, function (err, data) {
        if (err) {
            console.log('获取详情页错误' + err)
        } else {
            var views = data.views;
            views++;
            Article.update({_id: articleId}, {views: views}, function (err, result) {
                if (err) {
                    console.log(err)
                } else {
                    data.addTime = format(data.addTime);
                    data.views++;
                    res.send({
                        code: 0,
                        msg: '获取文章详情页成功',
                        data
                    })
                }
            })

        }
    })
})

//提交评论
router.post('/articleDetail/:aid', function (req, res) {
    let articleId = req.params.aid;
    let comment = req.body;
    Article.findOne({_id: articleId}, function (err, data) {
        if (err) {
            console.log('获取详情页错误' + err)
        } else {
            Article.update({_id: articleId}, {$push: {comments: comment}}, function (err, result) {
                if (err) {
                    console.log(err)
                } else {
                    res.send({
                        code: 0,
                        msg: '评论成功'
                    })
                }
            })
        }
    })
})


// 获取阅读排行信息
router.get('/articleRanking', function (req, res) {
    Article.find({}).sort({views: -1}).limit(5).exec(function (err, data) {
        if (err) {
            console.log('获取排行榜出错')
            console.log(err)
        } else {

            var resultData = []
            data.forEach(function (item) {
                var obj = {};
                obj.id = item._id;
                obj.title = item.title;
                obj.views = item.views;
                resultData.push(obj);
            })
            res.send({
                code: 0,
                msg: '获取阅读排行成功',
                data: resultData
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


module.exports = router;
