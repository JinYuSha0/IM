const utils = require('../utils/utils')
const EVENT_TYPE = require('../event')

class User {
    constructor(io, eventEmitter) {
        this.io = User.io = io
        this.namespace = User.namespace = io.of(User.NAME)
        this.eventEmitter = User.eventEmitter = eventEmitter

        this.onConnect = this.onConnect.bind(this)
        this.namespace.on(EVENT_TYPE.connect, this.onConnect)

        this.staffList = new Set()
        this.staffIdMap = new Map()
        this.onStaffConnect = this.onStaffConnect.bind(this)
        this.onStaffDisconnect = this.onStaffDisconnect.bind(this)
        this.eventEmitter.on(require('./staff').EVENT_TYPE.staffConnect, this.onStaffConnect)
        this.eventEmitter.on(require('./staff').EVENT_TYPE.staffDisconnect, this.onStaffDisconnect)
    }

    verify(id, timestamp, sign) {
        return sign === utils.md5(`${id}-${timestamp}-user`)
    }

    async onConnect(socket) {
        const { id, timestamp, sign, staffId } = socket.handshake.query
        if (this.verify(id, timestamp, sign)) {
            if (this.staffList.size === 0) {
                // 没有客服就断开连接
                socket.emit(
                    EVENT_TYPE.sysNotice,
                    utils.msgObject('没有客服'),
                )
            } else {
                const roomId = `room-${utils.randomStr()}`
                let staffSocket = null

                if (staffId && this.staffIdMap.has(staffId)) {
                    // 指定员工id 断线重连
                    staffSocket = this.staffIdMap.get(staffId)
                } else {
                    // 从员工列表随机获取一个人
                    const randomStaffIndex = utils.rangeRandomNum(0, this.staffList.size - 1)
                    staffSocket = Array.from(this.staffList)[randomStaffIndex]
                }

                socket.join(roomId, () => {
                    socket.emit(EVENT_TYPE.joinRoom, utils.msgObject({roomId}, 'info'))
                    socket.emit(EVENT_TYPE.sysNotice, utils.msgObject('系统欢迎'))
                    // 邀请员工进入房间
                    User.eventEmitter.emit(User.EVENT_TYPE.userConnect, {
                        userSocket: socket,
                        staffSocket,
                        roomId,
                    })
                })

                socket.on(EVENT_TYPE.sendMsg, function (data) {
                    const { roomId, msg } = data
                    const { id } = socket.handshake.query

                    User.namespace.to(roomId).emit(
                        EVENT_TYPE.receiveMsg,
                        utils.msgObject({
                            id,
                            roomId,
                            msg,
                        })
                    )

                    User.io.of(require('./staff').NAME).to(roomId).emit(
                        EVENT_TYPE.receiveMsg,
                        utils.msgObject({
                            id,
                            roomId,
                            msg,
                        })
                    )
                })

                socket.once(EVENT_TYPE.disconnect, function () {
                    socket.leave(roomId)
                    socket.removeAllListeners([EVENT_TYPE.sendMsg])
                    // 房间解散
                    User.eventEmitter.emit(User.EVENT_TYPE.userDisconnect, {
                        userSocket: socket,
                        staffSocket,
                        roomId,
                    })
                })
            }
        } else {
            socket.disconnect(true)
        }
    }

    onStaffConnect({ id, socket }) {
        this.staffList.add(socket)
        this.staffIdMap.set(id, socket)
    }

    async onStaffDisconnect({ id, socket }) {
        this.staffList.delete(socket)
        this.staffIdMap.delete(id)

        if (this.staffList.size === 0) {
            await utils.nextTick()
            this.namespace.emit(EVENT_TYPE.sysNotice, utils.msgObject('所有客服都离线'))
        }
    }
}

User.NAME = '/user'

User.EVENT_TYPE = {
    userConnect: 'USER_CONNECT',
    userDisconnect: 'USER_DISCONNECT',
}

module.exports = User
