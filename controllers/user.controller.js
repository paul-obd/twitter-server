const User = require('../models/user.model');
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../config/jwtsecret');
const Posts = require('../models/post.model');
const mailSender = require('../utils/nodeMailer')


exports.signUp = async (req, res, next) => {
    try {
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            const err = new Error('validation Failed!')
            err.statusCode = 422
            err.data = validationErrors.array();
            throw err
        }

        const email = req.body.email
        const password = req.body.password
        const userName = req.body.userName
        const hashedPassword = await bcrypt.hash(password, 12)
        const user = new User({
            email: email,
            password: hashedPassword,
            userName: userName
        })

        const result = await user.save()

        const token = jwt.sign({
            email: result.email,
            userId: result._id,
            userName: result.UserName
        },
            jwtSecret,
            { expiresIn: '1s' }
        )

        mailSender.sendEmail(result.email, "Confirm You email", "", 
        '<a href='+process.env.CLIENT+ 'account-verification'+'/'+token+'>Click this link to verify your account</a>'
        )
        res.status(201).send({ message: "Please check your email to verify Your Account", user: result })




    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)

    }
}

exports.resendConfirmationEmail = async (req, res, next)=>{
    try {
        const userEmail = req.params.email
        const user = await User.findOne({email: userEmail})
        if(!user){
            let err = new Error('A user with this email could not be found! Please SignUp.')
            err.statusCode = 404
            throw err
        }
        const token = jwt.sign({
            email: user.email,
            userId: user._id,
            userName: user.UserName
        },
            jwtSecret,
            { expiresIn: '24h' }
        )

        mailSender.sendEmail(user.email, "Confirm You email", "", 
        '<a href='+process.env.CLIENT+ 'account-verification'+'/'+token+'>Click this link to verify your account</a>'
        )
        res.status(201).send({ message: "Please check your email to verify Your Account", user: user })

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}


exports.logIn = async (req, res, next) => {
    try {
        const email = req.body.email
        const userName = req.body.userName
        const password = req.body.password
        let user;
        if (email) {
            user = await User.findOne({ email: email })
            if (!user) {
                let err = new Error('A user with this email could not be found! Please SignUp.')
                err.statusCode = 402
                throw err
            }else if(user.activated == false){
                const token = jwt.sign({
                    email: user.email,
                    userId: user._id,
                    userName: user.UserName
                },
                    jwtSecret,
                    { expiresIn: '24h' }
                )
        
                mailSender.sendEmail(user.email, "Confirm You email", "", 
                '<a href='+process.env.CLIENT+ 'account-verification'+'/'+token+'>Click this link to verify your account</a>'
                )
                let err = new Error('Your account is not activated! We sent you a confirmation link to your email, please check it.')
                err.statusCode = 402
                throw err
            }
        }
        else if (userName) {
            user = await User.findOne({ userName: userName })
            if (!user) {
                let err = new Error('A user with this username could not be found! Please SignUp')
                err.statusCode = 401
                throw err
            }else if(user.activated == false){
                const token = jwt.sign({
                    email: user.email,
                    userId: user._id,
                    userName: user.UserName
                },
                    jwtSecret,
                    { expiresIn: '24h' }
                )
        
                mailSender.sendEmail(user.email, "Confirm You email", "", 
                '<a href='+process.env.CLIENT+ 'account-verification'+'/'+token+'>Click this link to verify your account</a>'
                )
                let err = new Error('Your account is not activated! We sent you a confirmation link to your email, please check it.')
                err.statusCode = 402
                throw err
            }
        }

        const isPasswordEqual = await bcrypt.compare(password, user.password)
        if (!isPasswordEqual) {
            let err = new Error('Wrong password! Please try again')
            err.statusCode = 401
            throw err
        }

        const token = jwt.sign({
            email: user.email,
            userId: user._id,
            userName: user.UserName
        },
            jwtSecret,
            { expiresIn: '48h' }
        )

        res.status(200).send({ token: token, user: user })


    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)


    }
}

exports.getUserProfile = async (req, res, next) => {
    try {
        let userId = req.userId
        const result = await User.findById(userId)
        if (!result) {
            let err = new Error('user not found')
            err.statusCode = 404
            throw err
        }

        let userPosts = []

        for (let i = 0; i < result.posts.length; i++) {
            const post = result.posts[i];
            let currentPost = await Posts.findById(post)
            if (currentPost.imageUrl) {
                currentPost.imageUrl = currentPost.imageUrl.toString().replace(/\\/g, "/")

            }
            userPosts.push(currentPost)
        }




        res.send({
            _id: result._id,
            email: result.email,
            password: result.password,
            userName: result.userName,
            posts: userPosts,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt
        })

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)


    }
}

exports.getOneUser = async (req, res, next) => {
    try {
        let userId = req.params.id
        const result = await User.findById(userId)
        if (!result) {
            let err = new Error('user not found')
            err.statusCode = 404
            throw err
        }
        let userPosts = []

        for (let i = 0; i < result.posts.length; i++) {
            const post = result.posts[i];
            let currentPost = await Posts.findById(post)
            if (currentPost.imageUrl) {
                currentPost.imageUrl = currentPost.imageUrl.toString().replace(/\\/g, "/")

            }
            userPosts.push(currentPost)
        }


        res.send({
            _id: result._id,
            email: result.email,
            password: result.password,
            userName: result.userName,
            posts: userPosts,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt
        })

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)


    }
}

exports.confirmEmail = async (req, res, next)=>{
    try {
        let userId = req.params.id
        const user = await User.findById(userId)
        if(!user){
            let err = new Error('You are not a registered user!')
            err.statusCode = 422
            throw err
        }
        const option = { new: true }

        const activatedUser = await User.findOneAndUpdate({_id: userId}, {activated: true}, option)
        res.send({message: "Your Email is Confirmed Successfully! Please LogIn.",user: user})
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
        
    }
}



exports.forgotPassword = async (req, res, next) => {
    try {
        let userEmail = req.body.email
        let user = await User.findOne({ email: userEmail })
        if (!user) {
            let err = new Error('There is no registered user with this email!')
            err.statusCode = 404
            throw err
        }

        const token = jwt.sign({
            email: user.email,
            userId: user._id,
            userName: user.UserName
        },
            jwtSecret,
            { expiresIn: '4m' }
        )

        mailSender.sendEmail(user.email, "Reset password",
            ('Hello' + user.UserName + '\n Kindly click the link below to reset your password'),
            ('<a href=' + process.env.CLIENT + "/reset-password/" + user._id + "/" + token + '>Click here to reset your password</a>')
        ).then(result => 
            res.send({message: 'Email was sent To: '+ result.envelope.to})
        ).catch(error => 
          {
              let err = new Error('Email failed to be sent!')
              throw err
          } 
        )




    } catch (err) {

        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)

    }
}

exports.resetPassword = async (req, res, next)=>{
    try {
        let userId = req.body.id
        const isUser = await User.findById(userId)
        if(!isUser){
            let err = new Error('Unvalid User!')
            err.statusCode = 404
            throw err
        }
        
        const option = { new: true }
        let newPassword = await bcrypt.hash(req.body.password, 12)
  
        const userToBeUpdated = await User.findOneAndUpdate({_id: userId},{password: newPassword}, option )
        res.send({message: "Your password has been reset successfully! You can LogIn now."})
    } catch (err) {
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)
        
    }
}