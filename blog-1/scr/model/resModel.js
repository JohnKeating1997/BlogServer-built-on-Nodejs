class BaseModel {
    //确定要返回的数据
    constructor(data, message) {
        if (typeof data === 'string') {
            //兼容只传入了一个string类型的message的情况,比如说只有一个错误信息，都错误了哪有data,只有message,所以这里兼容一下
            this.message = data
            data = null
            message = null
        }
        if (data) {
            this.data = data
        }
        if (message) {
            this.message = message
        }
        //啥也没有就data和message都是空呗
    }
}

class SuccessModel extends BaseModel {
    //加一个状态码errno
    constructor(data, message) {
        super(data, message) //调用父类方法，给SuccessModel对象绑定data和message
        this.errno = 0
    }
}

class ErrorModel extends BaseModel {
    //加一个状态码errno
    constructor(data, message) {
        super(data, message)
        this.errno = -1
    }
}

module.exports = {
    SuccessModel,
    ErrorModel
}