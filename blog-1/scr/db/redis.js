const redis = require('redis')
const {REDIS_CONF} = require('../conf/db')

// 创建客户端
const redisClient = redis.createClient(REDIS_CONF.port,REDIS_CONF.host)
redisClient.on('error',err=>{
    console.error(err)
})

function set(key,val){
    if(typeof val === 'object'){
        val = JSON.stringify(val) //因为val要是字符串的格式
    }
    redisClient.set(key,val,redis.print)
}

function get(key){
    const promise = new Promise((resolve,reject)=>{
        redisClient.get(key,(err,val)=>{
            if(err){
                reject(err)
                return 
            }
            if(val==null){
                resolve(null)
            }
            // 兼容val是一个对象的情况
            try{
                resolve(JSON.parse(val))
            }catch(error){
                resolve(val)
            }

            //单例模式，不能推出，以供下一次使用
            // redisClient.quit()
        })
    })
    return promise
}

module.exports = {
    set,
    get
}