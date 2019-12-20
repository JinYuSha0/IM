const EVENT_TYPE = {
    connect: 'connect',
    disconnect: 'disconnect',
    disconnecting: 'disconnecting',

    sysNotice: 'SYSTEM_NOTICE',
    joinRoom: 'JOIN_ROOM',
    leaveRoom: 'LEAVE_ROOM',

    sendMsg: 'SEND_MSG',
    receiveMsg: 'RECEIVE_MSG',
}

module.exports = EVENT_TYPE
