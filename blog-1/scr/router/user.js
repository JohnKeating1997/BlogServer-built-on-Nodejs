const user = require('../controller/user')
const { login } = require('../controller/user')
const { set } = require('../db/redis')
const { SuccessModel, ErrorModel } = require('../model/resModel')


const handleBlogRouter = (req, res) => {
    const method = req.method
    //登录
    if (method === 'POST' && req.path === '/api/user/login') {
        const { username, password } = req.body
        const result = login(username, password)
        return result.then((userData) => {
            if (userData.username) {
                //登录成功后，设置session，即把返回来的用户数据存到session里
                req.session.username = userData.username
                req.session.realname = userData.realname
                //把session的更改同步到redis中去
                set(req.sessionId,req.session)

                console.log('session is: ',req.session)

                return new SuccessModel(`欢迎你，${userData.username}`)
            } else {
                return new ErrorModel('登录失败！请检查用户名或密码')
            }
        })
        // if(result.username){
        //     return new SuccessModel(`欢迎你，${result.username}`)
        // }else{
        //     return new ErrorModel('登录失败！请检查用户名或密码')
        // }
    }
    //验证是否已经登录
    if (method === 'GET' && req.path === '/api/user/login-test') {
        if (req.session.username) {
            return Promise.resolve(

                new SuccessModel(`欢迎您回来，您的真名为${req.session.realname}`)
            )
        }
        return Promise.resolve(
            new ErrorModel('尚未登录')
        )
    }
}
module.exports = handleBlogRouter