# BlogServer-built-on-Nodejs
一个练手的项目，原生nodejs写了一个博客管理系统，用户信息和博文储存于mysql，使用redis缓存用户登录的session，并用nginx反向代理实现了本地前后端联调。

实现的功能包括：
1. 获取用户的博文列表；查看博文详情；更新博文；删除博文；
2. 缓存用户登录信息，以cookie的形式返回redis里存储的sessionId,用户首次登录之后凭sessionId自动登录

## PORT:
* server: 8000 后端管理系统，/api 与http-server加以区分
* http-server: 8001  对用户开放的端口，返回html文本
* server和http-server 通过nginx反向代理统一到8080端口
* mysql: 3306
* redis: 6379

