const mongoose = require('mongoose')

const Schema = mongoose.Schema

const TokenSchema = new Schema({
    token: {
        type: String,
        required: true
    },
    valid: {
        type: Boolean,
        required: false,
        default: false
    }
})

const Token = mongoose.model('token', TokenSchema)

module.exports = Token