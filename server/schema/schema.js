/**
 * Created by chenmeng on 2017/2/19.
 */
let mongoose = require('mongoose');
let url = require('../../config').url
mongoose.connect(url)
mongoose.Promise = Promise;
let UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    avatar:String,
    isAdmin: {
        type: Boolean,
        default: false
    }
})
exports.User = mongoose.model('User', UserSchema);


let ObjectId = mongoose.Schema.Types.ObjectId
let ArticleSchema = new mongoose.Schema({
    // 标题
    title: String,

    // 作者 关联用户id
    author: {
        type: ObjectId,
        ref: 'User'
    },

    // 简介
    summary: String,

    // 分类标签
    category: String,

    // 内容
    content: {
        type: String,
        default: ''
    },

    // 添加时间
    addTime: {
        type: Date,
        default: new Date
    },
// 阅读量
    views: {
        type: Number,
        default: 0
    },
// 评论
    comments: {
        type: Array,
        default: []
    }
})
exports.Article = mongoose.model('Article', ArticleSchema);
