const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    activated:{
        type: Boolean,
        default: false
    },
    posts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'product'
        }
    ],
},

    { timestamps: true }
);


const User = mongoose.model('user', userSchema)

module.exports = User


