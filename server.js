/**
 * Created by chenmeng on 2017/1/24.
 */
let express = require('express');
let app = express();
let path = require('path');
let fs = require('fs')
// 导入路由
let main = require('./server/routes/main');
let admin = require('./server/routes/admin');

let config = require('./config');

let session = require('express-session');
let MongoStore = require('connect-mongo')(session);

app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'meng',
    store: new MongoStore({url:config.url})
}));


let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json())

app.use('/public',express.static(path.join(__dirname,'app','main','public')))
app.use('/public',express.static(path.join(__dirname,'app','admin','public')))
app.use('/node_modules',express.static(path.resolve('node_modules')));

app.use('/',main);
app.use('/admin',admin)

app.listen(config.port);
