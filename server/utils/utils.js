const crypto = require('crypto')
const msgObject = require('./msgObject')

const hash = (method, s, format) => {
    const sum = crypto.createHash(method)
    const isBuffer = Buffer.isBuffer(s)
    if (!isBuffer && typeof s === 'object') {
        s = JSON.stringify(s)
    }
    sum.update(s, isBuffer ? 'binary' : 'utf8')
    return sum.digest(format || 'hex')
}

const md5 = (s, format) => {
    return hash('md5', s, format)
}

const nextTick = () => {
    return new Promise((resolve) => {
        process.nextTick(() => resolve())
    })
}

const delay = (ms) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), ms)
    })
}

const rangeRandomNum = (minNum, maxNum) => {
    switch(arguments.length){
        case 1:
            return parseInt(Math.random()*minNum+1,10)
            break
        case 2:
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10)
            break
        default:
            return 0
            break
    }
}

const randomStr = () => {
    return Math.random().toString(36).split('.')[1]
}

const bothTodo = (objArr, methodName) => {
    return (...args) => {
        objArr.forEach(obj => {
            obj[methodName].apply(obj, args)
        })
    }
}

module.exports = {
    md5,
    msgObject,
    nextTick,
    delay,
    rangeRandomNum,
    randomStr,
    bothTodo,
}
