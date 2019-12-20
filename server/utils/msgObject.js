module.exports = function (msg, type = 'string') {
    try {
        if (typeof msg === 'object') {
            type = 'json'
            msg = JSON.stringify(msg)
        }
    } catch (e) {
        type = 'string'
    }

    return mask(
        Buffer.from(
            JSON.stringify({
                timestamp: +new Date(),
                type,
                msg,
            })
        )
    )
}

// 掩码
function mask(buf, code = [5, 4, 1, 88]) {
    for (let i = 0; i < buf.length; i++) {
        buf[i] = buf[i] ^ code[i % code.length]
    }
    return buf
}
