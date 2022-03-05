const mongoose = require('mongoose')


const Schema = mongoose.Schema;

const productSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            required: false
        },
        content: {
            type: String,
            required: true
        },
        creator:{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {timestamps: true}
)

const Posts = mongoose.model('post', productSchema)

module.exports = Posts