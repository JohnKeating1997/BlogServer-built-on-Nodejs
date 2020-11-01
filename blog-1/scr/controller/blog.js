const { exec } = require('../db/mysql')

const getList = (author, keyword) => {

    // //先返回假数据，格式正确
    // return [
    //     {
    //         id: 1,
    //         title: "标题1",
    //         content: "内容1",
    //         createTime: 1601796418837,
    //         author: 'John'
    //     },
    //     {
    //         id: 2,
    //         title: '标题2',
    //         content: '内容2',
    //         createTime: 1601796495094,
    //         author: 'Tom'
    //     }
    // ]

    let sql = `select * from blogs where 1=1 ` // where 1=1是个恒正确命题，只是为了兼容没有具体筛选条件的情况
    if (author) {
        sql += `and author='${author}' `
    }
    if (keyword) {
        sql += `and title like '%${keyword}%' `
    }
    //按照创建时间降序排列
    sql += `order by createtime desc;`   //别忘了分号结尾
    //return 读取sql 的 promise对象
    return exec(sql)
}
const getDetail = (id) => {
    //     //下面是假数据
    //     return {
    //         id: 1,
    //         title: "标题1",
    //         content: "内容1",
    //         createTime: 1601796418837,
    //         author: 'John'
    //     }
    // }

    let sql = `select * from blogs where 1=1 `
    if (id) {
        sql += `and id='${id}'`
    }
    return exec(sql).then((resuletArr) => {
        return resuletArr[0] //因为id是pk，所以一个id对应着唯一的一个数据，因此返回的时候不返回数组而是数组里唯一的那个对象
    })
}

const newBlog = (blogData = {}) => {
    // console.log("获取到了要新建的blogData：", blogData)
    // //下面是假数据
    // return {
    //     id: 3
    // }

    // blogData是一个博客对象，包含title content 属性
    const title = blogData.title
    const content = blogData.content
    const author = blogData.author
    const createTime = Date.now()

    const sql = `
        insert into blogs (title,content,author,createtime)
        values('${title}','${content}','${author}',${createTime});
    `
    return exec(sql).then((insertResult)=>{
        console.log(insertResult)
        return{
            id: insertResult.insertId
        }
    })

}

const updateBlog = (id, blogData = {}) => {
    // console.log("获取到了要更新的blogData：id为 ", id, "内容为: ", blogData)
    // //下面是假数据，就直接更新成功了
    // return true

    //blogData是一个博客对象，包含title content 属性
    const title = blogData.title
    const content = blogData.content
    
    const sql = `
        update blogs set title='${title}',content='${content}' where id=${id} 
    `
    return exec(sql).then((updateResult)=>{
        // console.log('updateResult is ',updateResult)
        if(updateResult.affectedRows > 0){ //如果影响的行数大于0才显示成功
            return true
        }
        return false
    })
}

const deleteBlog = (id,author) => {
    // console.log("获取到了要删除的blog：id为 ", id)
    // //下面是假数据，就直接删除失败了
    // return false
    const sql = `delete from blogs where id=${id} and author='${author}'`
    return exec(sql).then((deleteResult)=>{
        console.log('deleteResult is ',deleteResult)
        if(deleteResult.affectedRows > 0){ //如果影响的行数大于0才显示成功
            return true
        }
        return false
    })

}
module.exports = {
    getList,
    getDetail,
    newBlog,
    updateBlog,
    deleteBlog
}