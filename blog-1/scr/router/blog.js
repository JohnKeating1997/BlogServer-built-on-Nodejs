const {
    getList,
    getDetail,
    newBlog,
    updateBlog,
    deleteBlog
} = require('../controller/blog')

const { SuccessModel, ErrorModel } = require('../model/resModel')

const loginCheck = (req) => {
    const method = req.method
    if (!req.session.username) {
        //如果session中没有查询到对应的username，直接返回错误
        return Promise.resolve(
            new ErrorModel('尚未登录')
        )
    }
}

const handleBlogRouter = (req, res) => {
    const method = req.method
    const id = req.query.id
    //获取博客列表
    if (method === 'GET' && req.path === '/api/blog/list') {
        let author = req.query.author || '' //如果没有就空字符串
        const keyword = req.query.keyword || ''
        // const listData = getList(author, keyword)
        // return new SuccessModel(listData)

        if (req.query.isadmin) {
            //管理员界面
            const loginCheckResult = loginCheck(req)
            if (loginCheckResult) {
                //未登录
                return loginCheckResult
            }
            //强制查询自己的博客
            author = req.session.username
        }


        const result = getList(author, keyword)
        //返回then里回调函数返回的成功模型
        return result.then((listData) => {
            return new SuccessModel(listData)
        })
    }

    //获取博客详情
    if (method === 'GET' && req.path === '/api/blog/detail') {
        const id = req.query.id
        // const data = getDetail(id)
        // return new SuccessModel(data)
        const result = getDetail(id)
        return result.then((data) => {
            return new SuccessModel(data)
        })
    }

    //新建一篇博客
    if (method === 'POST' && req.path === '/api/blog/new') {
        // const data = newBlog(req.body)//将新微博的内容传给newBlog函数,新的内容就是解析出后的req.body
        // return new SuccessModel(data)
        const loginCheckResult = loginCheck(req)
        if (loginCheckResult) {
            //未登录
            return loginCheckResult
        }

        // req.body.author = 'zhangsan' //假数据，等待登录接口开发
        req.body.author = req.session.username
        const result = newBlog(req.body)
        return result.then((data) => {
            return new SuccessModel(data)
        })
    }

    //更新一篇博客
    if (method === 'POST' && req.path === '/api/blog/update') {
        // const result = updateBlog(id,req.body)
        // if(result){
        //     return new SuccessModel()
        // }else{
        //     return new ErrorModel('更新博客失败')
        // }
        const loginCheckResult = loginCheck(req)
        if (loginCheckResult) {
            //未登录
            return loginCheckResult
        }

        const result = updateBlog(id, req.body)
        return result.then((ret) => {
            if (ret) {
                return new SuccessModel()
            } else {
                return new ErrorModel('更新博客失败！')
            }
        })
    }

    //删除一篇博客
    if (method === 'POST' && req.path === '/api/blog/del') {
        // const result = deleteBlog(id)
        // if(result){
        //     return new SuccessModel()
        // }else{
        //     return new ErrorModel('删除博客失败')
        // }
        const loginCheckResult = loginCheck(req)
        if (loginCheckResult) {
            //未登录
            return loginCheckResult
        }

        // req.body.author = 'zhangsan' //假数据，等待登录接口开发
        req.body.author = req.session.username //假数据，等待登录接口开发
        const result = deleteBlog(id, req.body.author)
        return result.then((ret) => {
            if (ret) {
                return new SuccessModel()
            } else {
                return new ErrorModel('删除博客失败！')
            }
        })
    }
}

module.exports = handleBlogRouter