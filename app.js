// const { rejects } = require('assert')
const querystring = require('querystring')
const { get, set } = require('./scr/db/redis')
const handleBlogRouter = require('./scr/router/blog')
const handleUserRouter = require('./scr/router/user')

// // session 数据 全局变量
// const SESSION_DATA = {}

// 获取 cookie 的过期时间
const getCookieExpires = () => {
    const d = new Date()
    d.setTime(d.getTime() + (24 * 3600 * 1000)) //注意timestamp是毫秒级
    return d.toGMTString()
}

const getPostData = (req) => {
    const promise = new Promise((resolve, reject) => {
        if (req.method !== 'POST') { //如果不是POST请求根本不用解析POST数据
            resolve({}) //直接确定promise状态为成功，并给onResolved函数返回一个空对象
            return //下面的不用再执行了
        }
        if (req.headers['content-type'] !== 'application/json') { //如果传入的数据不是json格式，自动忽略这个POST
            resolve({})
            return
        }
        //下面就是正常POST请求的情况了
        let postData = '' //let一个postData变量
        req.on('data', (chunk) => {
            postData += chunk //利用自动类型转换就行了,buffer->string
        })
        req.on('end', () => {
            if (!postData) { //如果postData为空，那么也传一个空对象
                resolve({})
                return
            }
            resolve(
                JSON.parse(postData) //向onResolved函数传解析成对象的postData
            )
        })
    })
    return promise  //别忘了return新建好的promise对象！！！
}


const serverHandle = (req, res) => {
    // 设置返回格式 JSON
    res.setHeader('content-type', 'application/json')

    // 获取 path
    const url = req.url
    req.path = url.split('?')[0]

    //解析 query
    req.query = querystring.parse(url.split('?')[1])
    console.log(req.query)
    //解析 cookie
    req.cookie = {}
    const cookieStr = req.headers.cookie || ''
    //遍历，解析cookie，从string到object
    cookieStr.split(';').forEach((item) => {
        if (!item) return
        const pair = item.split('=')
        const key = pair[0].trim()
        const val = pair[1].trim()
        req.cookie[key] = val
    })
    // console.log(req.cookie)

    // //解析 session
    // let userId = req.cookie.userid 
    // let needSetCookie = false //是否需要设置cookie
    // if(userId){
    //     if(!SESSION_DATA[userId]){
    //         SESSION_DATA[userId] = {} // 初始化这个userId对应的SESSION_DATA
    //     }
    // } else{
    //     //如果匿名操作（用户没有登录），则随机生成一个userId
    //     needSetCookie = true
    //     userId = `${Date.now()}_${Math.random()}` //随机生成一个userId
    //     SESSION_DATA[userId] = {} // 初始化这个userId对应的SESSION_DATA
    // }
    // req.session = SESSION_DATA[userId] // 把堆空间中SESSION_DATA[userId]对象的地址赋值给session，这样后面操作req.session就是在操作SESSION_DATA[userId]


    //解析 session
    let userId = req.cookie.userid
    let needSetCookie = false //是否需要设置cookie
    if (!userId) {
        needSetCookie = true
        userId = `${Date.now()}_${Math.random()}`
        //初始化redis中的 session 值
        set(userId, {})
        
    }
    req.sessionId = userId
    get(req.sessionId).then(sessionData => {
        if (!sessionData) {
            //如果没有在redis中找到对应的key，则sessionData = null，这里就初始化一个空对象给redis里的这个session
            set(req.sessionId, {})
            req.session = {}
        } else {
            req.session = sessionData
        }
        console.log('req.session: ', req.session)
        //串联上解析post的promise
        return getPostData(req)
    })
        //解析 post
        .then((postData) => {
            //将postData对象作为req的属性body，没有的话为空也行嘛
            req.body = postData

            //处理blog路由
            const blogResult = handleBlogRouter(req, res)

            if (blogResult) { //如果handleBlogRouter有返回值,说明命中了blog路由
                blogResult.then((blogData) => {
                    //如果当前这个用户id没存在cookie里，res里设置一下cookie值
                    if (needSetCookie) {
                        res.setHeader('Set-Cookie', `userid=${userId};path=/;httpOnly;expires=${getCookieExpires()}`) //httpOnly防止js在本地浏览器进行修改
                    }
                    res.end(
                        JSON.stringify(blogData)
                    )
                })
                return //不用再试下面的路由了
            }

            //处理 user 路由
            const userResult = handleUserRouter(req, res)
            if (userResult) {
                userResult.then((userData) => {
                    //如果当前这个用户id没存在cookie里，res里设置一下cookie值
                    if (needSetCookie) {
                        res.setHeader('Set-Cookie', `userid=${userId};path=/;httpOnly;expires=${getCookieExpires()}`) //httpOnly防止js在本地浏览器进行修改
                    }
                    res.end(
                        JSON.stringify(userData)
                    )
                })
                return
            }


            res.writeHead(404, { "content-type": "text/plain" })
            res.write("404 Not Found\n")
            res.end()
        })
}
// env: process.env.NODE_ENV
module.exports = serverHandle