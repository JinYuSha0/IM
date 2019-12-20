module.exports = {
    path: '/im',            // 路径
    serveClient: false,     // 是否提供客户端文件
    pingTimeout: 30 * 1000, // 没有pong包后30秒关闭连接
    pingInterval: 5 * 1000, // 间隔5秒发送一个ping包
}
