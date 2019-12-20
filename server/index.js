const fs = require('fs')
const path = require('path')

const Koa = require('koa')
const app = new Koa()

app.use((ctx, next) => {
    const url = ctx.request.url
    if (url === '/user') {
        ctx.response.set('content-type', 'text/html;charset=utf-8')
        ctx.body = fs.createReadStream(path.join(__dirname, '../frontend/user.html'))
    } else if (url === '/staff') {
        ctx.response.set('content-type', 'text/html;charset=utf-8')
        ctx.body = fs.createReadStream(path.join(__dirname, '../frontend/staff.html'))
    }
    next()
})

const server = require('http').createServer(app.callback())
const io = require('socket.io')(server, require('./config'))
const events = require('events')

const eventEmitter = new events.EventEmitter()

io.use((socket, next) => {
    next()
})

const UserNamespace = new (require('./namespace/user'))(io, eventEmitter)
const StaffNamespace = new (require('./namespace/staff'))(io, eventEmitter)

server.listen(3000, function () {
    console.log(`server start on port ${3000}`)
})
