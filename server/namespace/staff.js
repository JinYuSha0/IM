const utils = require('../utils/utils')
const EVENT_TYPE = require('../event')

class Staff {
    constructor(io, eventEmitter) {
        this.io = Staff.io = io
        this.namespace = Staff.namespace = io.of(Staff.NAME)
        this.eventEmitter = Staff.eventEmitter = eventEmitter

        this.onConnect = this.onConnect.bind(this)
        this.namespace.on(EVENT_TYPE.connect, this.onConnect)

        this.onUserConnect = this.onUserConnect.bind(this)
        this.eventEmitter.on(require('./user').EVENT_TYPE.userConnect, this.onUserConnect)
        this.onUserDisconnect = this.onUserDisconnect.bind(this)
        this.eventEmitter.on(require('./user').EVENT_TYPE.userDisconnect, this.onUserDisconnect)
    }

    verify(id, timestamp, sign) {
        return sign === utils.md5(`${id}-${timestamp}-staff`)
    }

    onConnect(socket) {
        const { id, timestamp, sign } = socket.handshake.query
        if (this.verify(id, timestamp, sign)) {
            this.eventEmitter.emit(Staff.EVENT_TYPE.staffConnect, {
                id,
                socket,
            })

            socket.on(EVENT_TYPE.sendMsg, function (data) {
                const { roomId, msg } = data
                const { id } = socket.handshake.query
                Staff.namespace.to(roomId).emit(
                    EVENT_TYPE.receiveMsg,
                    utils.msgObject({
                        id,
                        roomId,
                        msg,
                    })
                )

                Staff.io.of(require('./user').NAME).to(roomId).emit(
                    EVENT_TYPE.receiveMsg,
                    utils.msgObject({
                        id,
                        roomId,
                        msg,
                    })
                )
            })
            socket.on(EVENT_TYPE.disconnect, this.onDisconnect)
            socket.on(EVENT_TYPE.disconnecting, this.onDisconnecting)
        } else {
            socket.disconnect(true)
        }
    }

    onDisconnecting(reason) {
        let rooms = Object.keys(this.rooms)
        rooms = rooms.splice(1, rooms.length - 1)
        rooms.forEach(roomId => {
            Staff.io.of(require('./user').NAME).to(roomId)
                .emit(EVENT_TYPE.sysNotice, utils.msgObject({
                    msg: '客服离开'
                }))
        })
    }

    onDisconnect(reason) {
        const { id } = this.handshake.query
        Staff.eventEmitter.emit(Staff.EVENT_TYPE.staffDisconnect, {
            id,
            socket: this,
        })
    }

    onUserConnect({ userSocket, staffSocket, roomId }) {
        staffSocket.join(roomId, () => {})
        staffSocket.emit(EVENT_TYPE.joinRoom, utils.msgObject({roomId}, 'info'))
        Staff.io.of(require('./user').NAME).to(roomId).emit(
            EVENT_TYPE.receiveMsg,
            utils.msgObject('客服1为您服务')
        )
    }

    onUserDisconnect({ userSocket, staffSocket, roomId }) {
        this.namespace.to(roomId).emit(EVENT_TYPE.sysNotice, utils.msgObject('用户离开'))
        staffSocket.emit(EVENT_TYPE.leaveRoom, utils.msgObject({ roomId }))
        staffSocket.leave(roomId, () => {})
    }
}

Staff.NAME = '/staff'

Staff.EVENT_TYPE = {
    staffConnect: 'STAFF_CONNECT',
    staffDisconnect: 'STAFF_DISCONNECT',
}

module.exports = Staff

