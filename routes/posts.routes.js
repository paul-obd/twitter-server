const express = require('express')
const router = express.Router();
const postsController = require('../controllers/post.controller')
const isAuth = require('../middlewear/is-auth')
const { body } = require('express-validator')


router.get('/all-posts', isAuth,  postsController.getAllPosts);

router.get('/one-post/:id', isAuth, postsController.getOnePost)

router.post('/add-post',  isAuth, [
    body('title')
    .notEmpty()
    .withMessage('Title is required'),
    body('content')
    .notEmpty()
    .withMessage('Content is required')
    
], postsController.addPost);

router.put('/put-post/:id', isAuth,postsController.updatePost)





module.exports = router;