const utils = require('../utils/utils')

class Admin {
    constructor(io) {
        this.namespace = io.of('/admin')
    }

    verify(id, timestamp, sign) {
        return sign === utils.md5(`${id}-${timestamp}-admin`)
    }
}
