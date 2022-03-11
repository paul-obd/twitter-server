const Posts = require('../models/post.model')
const path = require('path')
const fs = require('fs')
const User = require('../models/user.model')
const { validationResult } = require('express-validator')


exports.getAllPosts = async (req, res, next) => {
    try {
        const result = await Posts.find()
        await result.forEach(tweet => {
            if (tweet.imageUrl) {
                tweet.imageUrl = tweet.imageUrl.toString().replace(/\\/g, "/")
            }
        });
        if (!result) {
            let err = new Error('error while fetching posts')
            err.statusCode = 500
            throw err
        }
        let posts = []
        for (let i = 0; i < result.length; i++) {
            const post = result[i];
            let user = await User.findById(post.creator)
            let newPost = {
                _id: post._id,
                imageUrl: post.imageUrl,
                content: post.content,
                creator: user,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
                
            }
            posts.push(newPost)

            
        }
        

        res.send(posts)
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)

    }
};

exports.getOnePost = async (req, res, next) => {
    try {
        let id = req.params.id;
        const post = await Posts.findById(id);

        if (post == null) {
            let err = new Error('post is unavailable')
            err.statusCode = 404
            throw err
        } else {
            if (post.imageUrl) {
                post.imageUrl = post.imageUrl.toString().replace(/\\/g, "/")
            }
            let user = await User.findById(post.creator)
            let newPost = {
                _id: post._id,
                imageUrl: post.imageUrl,
                title: post.title,
                content: post.content,
                creator: user,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
                
            }

            res.send(newPost)
        }

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)

    }
}


exports.addPost = async (req, res, next) => {
    try {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            const err = new Error('validation Failed!')
            err.statusCode = 422
            err.data = validationErrors.array();
            throw err
        }
        let post;
        if (!req.file) {
            post = new Posts({
                title: req.body.title,
                content: req.body.content,
                creator: req.userId
            })

        } else if (req.file) {
            post = new Posts({
                title: req.body.title,
                imageUrl: req.file.path,
                content: req.body.content,
                creator: req.userId
            })

        }

        const addedPost = await post.save()

        const user = await User.findById(req.userId)
        user.posts.push(addedPost)
        const creator = await user.save()


        res.status(200).json({
            message: 'Post added successfully',
            post: addedPost,
            creator: creator
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
};



exports.updatePost = async (req, res, next) => {
    try {
        const postId = req.params.id

        let postToBeUpdated = await Posts.findById(postId)
        if (!postToBeUpdated) {
            let err = new Error('unavailable post to be updated.')
            err.statusCode = 404
            throw err
        }
        if (postToBeUpdated.creator.toString() !== req.userId) {
            let err = new Error('Update Rejected! You are not the creator of this.')
            err.statusCode = 401
            throw err

        }

        let post;
        const option = { new: true }
        if (req.file && req.body.imageUrl) {
            clearImage(req.body.imageUrl)
            post = {
                title: req.body.title,
                imageUrl: req.file.path,
                content: req.body.content,
                creator: req.userId
            }
        }
        else if (req.file && !req.body.imageUrl) {

            post = {
                title: req.body.title,
                imageUrl: req.file.path,
                content: req.body.content,
                creator: req.userId
            }
        }
        else if (!req.file && req.body.imageUrl) {
            post = {
                title: req.body.title,
                imageUrl: req.body.imageUrl,
                content: req.body.content,
                creator: req.userId
            }

        } else if (!req.file && !req.body.imageUrl && req.body.removedImg) {
            clearImage(req.body.removedImg)
            post = {
                title: req.body.title,
                imageUrl: null,
                content: req.body.content,
                creator: req.userId
            }
        }
         else if (!req.file && !req.body.imageUrl) {
            post = {
                title: req.body.title,
                content: req.body.content,
                creator: req.userId
            }
        }




        let result = await Posts.findOneAndUpdate({ _id: postId }, post, option)
        res.send({message: "Updated successfully!", post: result})

    } catch (err) {

        if (!err.statusCode) {
            err.statusCode = 500
        }

        next(err)

    }

}

const clearImage = (filePath) => {

    filePath = path.join(__dirname, '..', filePath)
   
    fs.unlink(filePath, err => {})

}



exports.deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id
        const postToBeDeleted = await Posts.findById(postId)
        if(!postToBeDeleted)
        {
            let err = new Error('Tweet cannot be found.')
            err.statusCode = 404
            throw err
        }
        if(postToBeDeleted.creator.toString() !== req.userId){
            let err = new Error('Delete Rejected! You are not the creator of this post.')
            err.statusCode = 401
            throw err
        }

        const deletedPost = await Posts.findByIdAndDelete(postId, { new: true })
        const creator = await User.findById(req.userId)
        creator.posts.pull(postId)
        creator.save()


        res.send({message: "Deleted successfully!", post: deletedPost})


    } catch (err) {

        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)

    }
}