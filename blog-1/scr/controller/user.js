const {exec} = require('../db/mysql')

const login = (username,password)=>{
    //先使用假数据
    // if(username === 'zhangsan' && password === '123'){
    //     return true
    // }
    // return false
    let sql = `select username,realname from users where username = '${username}' and password = '${password}'`
    return exec(sql).then((userArr)=>{
        return userArr[0] || {} //如果userArr[0]没有则返回空对象
    })
}

module.exports = {
    login
}