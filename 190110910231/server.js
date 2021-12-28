/*
 * @Date: 2021-12-23 
 * @LastEditTime: 2021-12-23 10:00:00
 * @LastEditors: Please set LastEditors
 * @FilePath: \190110910231\server.js
 */
const fs = require("fs")
const express = require('express')
const insertDB = require('./MongodbLib')
const app = express()
const cookies = require('cookies');
var router = express.Router()
app.use(express.static(__dirname))
app.set("view engine", "ejs")
app.set("views", "./views")

const mongoose = require('mongoose');//数据库工具
//设置跨域访问
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});


/**
 * 数据库构建
 */
let Schema = mongoose.Schema
//实例化
let mySchema = new Schema({
    id: {
        type: Number,
        unique: true
    },
    name: String,
    gender: String,

    during: Number,
    time_start: String,
    time_stop: String,
})
//站点信息
let Station = new Schema({
    Cid: Number,
    Cnumber: Number,
    Cname: String,
    dayd: Number,
    DayNum: Number
})
let loginsta = new Schema({
    name: String,
    password: String,
    supercode: String
})
//链接数据库
mongoose.connect('mongodb://localhost/myMongoose');;
// mongoose.connect('mongodb://172.21.2.236:27017/190110910231')
const Users = mongoose.model('users', mySchema);
const Stations = mongoose.model('sts', Station)
const loginstas = mongoose.model('login', loginsta)
//导入数据
try {
    const data = fs.readFileSync('./data/DataUser.json', 'utf8');
    const config = eval("(" + data + ")")
    for (let i = 0; i < 100; i++) {
        let name = config[i].user_name
        let gender = config[i].gender
        let during = config[i].trip_duration
        let time_start = config[i].start_time
        let time_stop = config[i].stop_time
        let isAdmin = config[i].isAdmin
        let UserName = new Users({
            id: i,
            name: name,
            gender: gender,
            during: during,
            time_start: time_start,
            time_stop: time_stop,
        })
        // UserName.save().then(()=>{
        //     if(i===99){
        //         console.log("数据库建立成功")
        //     }
        // })
    }
} catch (err) {
    console.log(`Error reading file from disk: ${err}`);
}

try {
    const data = fs.readFileSync('./data/dataStation.json', 'utf8');
    const config = eval("(" + data + ")")
    for (let i = 0; i < 100; i++) {
        let Cid = parseInt(config[i].Cid)
        let Cnumber = parseInt(config[i].Cnumber)
        let Cname = config[i].Cname
        let dayd = parseInt(config[i].Day)
        let DayNum = parseInt(config[i].dayNum)
        let station_ = new Stations({
            Cid: Cid,
            Cnumber: Cnumber,
            Cname: Cname,
            dayd: dayd,
            DayNum: DayNum
        })
        // station_.save().then(()=>{
        //     if(i===config.length-1){
        //         console.log("数据库建立成功")
        //     }
        // })
    }

} catch (err) {
    console.log(`Error reading file from disk: ${err}`);
}


let loginData = {}
let loginDataLast = []
app.get("/login-list1", (req, res, next) => {
    loginstas.find({ __v: 0 }, (err, docs) => {
        loginDataLast = []
        docs.forEach((item) => {
            loginDataLast.push(item._doc)
        })
        next()
        console.log("查找完成")

    })
})
app.get("/login-list1", (req, res, next) => {
    loginData = {}
    loginData['code'] = 0
    loginData['msg'] = ""
    loginData['count'] = loginDataLast.length
    loginData['data'] = loginDataLast
    res.send(loginData)
})
//获取数据库中得使用站点用户的数据
let personData = {}
let UserDataLast = []
app.get("/member-list1", (req, res, next) => {
    Users.find({ __v: 0 }, (err, docs) => {
        UserDataLast = []
        docs.forEach((item) => {
            UserDataLast.push(item._doc)
        })
        next()
        console.log("查找完成")
    })
})
app.get("/member-list1", (req, res, next) => {
    personData = {}
    personData['code'] = 0
    personData['msg'] = ""
    personData['count'] = UserDataLast.length
    personData['data'] = UserDataLast
    res.send(personData)
})
//获取数据库中的站点数据
let StationData = {}
let StationList = []
app.get("/station", (req, res, next) => {
    Stations.find({ __v: 0 }, (err, docs) => {
        StationList = []
        docs.forEach((item) => {
            StationList.push(item._doc)
        })
        next()
    })
})

app.get("/station", (req, res, next) => {
    StationData = {}
    StationData['code'] = 0
    StationData['msg'] = ""
    StationData['count'] = StationList.length
    StationData['data'] = StationList
    res.send(StationData)
})
/**
 * 删除数据
 */
app.get("/delete", (req, res) => {
    let Cid = parseInt(req.query.ID)
    let id
    UserDataLast.forEach((item) => {
        if (parseInt(item.id) === Cid) {
            _id = item._id
        }
    })
    let condition = {
        _id: _id,
    }
    Users.remove(condition, (err, data) => {
        if (err) {
            console.log("删除失败")
        } else {
            console.log("删除成功")
        }
    })
    res.send("success")
})
app.get("/deletes", (req, res) => {
    let Cid = parseInt(req.query.ID)
    let id
    StationList.forEach((item) => {
        if (parseInt(item.Cid) === Cid) {
            _id = item._id
        }
    })
    let condition = {
        _id: _id,
    }
    Stations.remove(condition, (err, data) => {
        if (err) {
            console.log("删除失败")
        } else {
            console.log("删除成功")
        }
    })
    res.send("success")
})
// //修改数据 
app.get("/change", (req, res) => {
    let data = req.query
    let id = parseInt(data.Cid)
    let name = data.Cname
    let gender = data.gender
    let during = parseInt(data.trip_duration)
    let time_start = data.time_start
    let time_stop = data.time_stop
    let _id
    UserDataLast.forEach((item) => {
        if (parseInt(item.id) === id) {
            _id = item._id
        }
    })
    const updataFields = {
        _id,
        id,
        name,
        gender,
        during,
        time_start,
        time_stop
    }
    Users.findByIdAndUpdate({ _id, _id }, updataFields, (err, data) => {
        if (err) {
            console.log("更改失败")

        } else {
            console.log("更改成功")

        }
    })
    res.send("success")
})

app.get("/changes", (req, res) => {
    let data = req.query
    let Cid = parseInt(data.Cid)
    let Number = data.Cnumber
    let Name = data.Cname
    let Day = parseInt(data.Day)
    let DayNum = parseInt(data.dayNum)
    let _id
    StationList.forEach((item) => {
        if (parseInt(item.Cid) === Cid) {
            _id = item._id
        }
    })
    const updataFields = {
        _id,
        Cid,
        Number,
        Name,
        Day,
        DayNum
    }
    Stations.findByIdAndUpdate({ _id, _id }, updataFields, (err, data) => {
        if (err) {
            console.log("更改失败")

        } else {
            console.log("更改成功")

        }
    })
    res.send("success")
})
//添加数据
let flagsu = "0"
app.get("/add", (req, res, next) => {
    let data = req.query
    let id = parseInt(data.Cid)
    let name = data.Cname
    let gender = data.gender
    let during = parseInt(data.trip_duration)
    let time_start = data.time_start
    let time_stop = data.time_stop
    const newcat = new Users({
        id,
        name,
        gender,
        during,
        time_start,
        time_stop,
    })
    newcat.save((err, data) => {
        if (err) {
            flagsu = "0"
            console.log(err)
            console.log('添加失败')
            next()
        } else {
            flagsu = "1"
            next()
            console.log('添加成功')
        }
    })
})
app.get("/add", (rep, res) => {
    res.send(flagsu)
})

let flagsu1 = "0"
app.get("/adds", (req, res, next) => {
    let data = req.query
    let Cid = parseInt(data.Cid)
    let Cnumber = data.Cnumber
    let Cname = data.Cname
    let dayd = parseInt(data.Day)
    let DayNum = parseInt(data.dayNum)
    const newcat = new Stations({
        Cid,
        Cnumber,
        Cname,
        dayd,
        DayNum
    })
    newcat.save((err, data) => {
        if (err) {
            flagsu1 = "0"
            console.log(err)
            console.log('添加失败')
            next()
        } else {
            flagsu1 = "1"
            next()
            console.log('添加成功')
        }
    })
})
app.get("/adds", (rep, res) => {
    res.send(flagsu1)
})

//筛选数据
let dataSelect = []
app.get("/select", (rep, res, next) => {
    let data = rep.query
    let list = {}
    let querys = {}
    let Cid = data.Cid
    let name = data.name
    let during = data.during
    list['id'] = Cid
    list['name'] = name
    list['during'] = during
    for (let key in list) {
        if (String(list[key]).length !== 0) {
            if (key === 'during') {
                querys[key] = { "$gt": parseInt(during) }
            } else if (key === 'name') {
                querys[key] = parseInt(name)
            } else {
                querys[key] = parseInt(Cid)
            }
        }
    }
    Users.find(querys, (err, docs) => {
        dataSelect = []
        docs.forEach((item) => {
            dataSelect.push(item._doc)
        })
        next()
    })
})
app.get("/select", (rep, res, next) => {
    console.log(dataSelect)
    res.send(dataSelect)
})

let dataSelects = []
app.get("/selects", (rep, res, next) => {
    let data = rep.query
    let list = {}
    let querys = {}
    let Cnumber = data.Cnumber
    let dayd = data.dayd
    let DayNum = data.DayNum
    list['Cnumber'] = Cnumber
    list['dayd'] = dayd
    list['DayNum'] = DayNum
    for (let key in list) {
        if (String(list[key]).length !== 0) {
            if (key === 'DayNum') {
                querys[key] = { "$gt": parseInt(DayNum) }
            } else if (key === 'dayd') {
                querys[key] = parseInt(dayd)
            }
            else {
                querys[key] = parseInt(Cnumber)
            }
        }
    }

    Stations.find(querys, (err, docs) => {
        dataSelects = []
        docs.forEach((item) => {
            dataSelects.push(item._doc)
        })
        next()
    })
})
app.get("/selects", (rep, res, next) => {
    console.log(dataSelects)
    res.send(dataSelects)
})

// //状态数据修改 
app.get("/status", (req, res) => {
    let data = req.query
    let id = parseInt(data.Cid)
    let name = data.Cname
    let gender = data.gender
    let during = parseInt(data.trip_duration)
    let time_start = data.time_start
    let time_stop = data.time_stop
    let _id
    UserDataLast.forEach((item) => {
        if (parseInt(item.id) === id) {
            _id = item._id
        }
    })
    const updataFields = {
        _id,
        id,
        name,
        gender,
        during,
        time_start,
        time_stop
    }
    Users.findByIdAndUpdate({ _id, _id }, updataFields, (err, data) => {
        if (err) {
            console.log("更改失败")

        } else {
            console.log("更改成功")

        }
    })
    res.send("success")
})

/**
 * 路由
 * 登录注册
 */
let a = ""
let name = ""
let password = ""
let submit = ""
let supercode = ""
app.get('/input', (req, res, next) => {
    name = req.query.name
    submit = req.query.sub
    password = req.query.password
    supercode = req.query.supercode
    if (name.length !== 0 && password.length !== 0) {
        next()
    } else {
        res.type('html')
        res.render(__dirname + "/view/login.ejs", { name: "用户名密码不能为空" })
    }
    //res.send("Hello Wold!")
})
app.get('/input', (req, res, next) => {
    if (submit === "注册") {
        // let data = {}
        //data[name]=password
        //insertDB.myInsert('mydb','mycollection',[{name:name,password:password}])
        let find = {
            name: name,
            password: password,
            supercode: supercode
        }
        var loginFlag = 0
        //  insertDB.myfind('190110910231','login',find,(docs)=>{
        insertDB.myfind('myMongoose', 'login', find, (docs) => {
            if (docs.length === 0) {
                insertDB.myInsert('myMongoose', 'login', [find])
                res.type('html')
                res.render(__dirname + "/view/index.ejs", { name: "注册成功" })
            } else {
                loginFlag = 1
                res.type('html')
                res.render(__dirname + "/view/login.ejs", { name: "用户名存在" })
            }
        })
    } else {
        let find = { name: name, password: password, supercode: supercode }
        insertDB.myfind('myMongoose', 'login', find, (docs) => {
            if (docs.length !== 0&&find.supercode=="1") {
                // console.log(docs)
                res.type('html')
                res.render(__dirname + "/view/demo.ejs", { logindata: "1" })
            }
            else if(docs.length !== 0&&find.supercode!=="1"){
                res.type('html')
                res.render(__dirname + "/view/demo.ejs", { logindata: "0" })
            }           
             else {
                res.type('html')
                res.render(__dirname + "/view/login.ejs", { logindata: "0" })
            }
        })
    }
})

app.listen(3000, () => {
    console.log("Successful")
})