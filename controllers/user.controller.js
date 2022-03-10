const User = require('../models/user.model');
const {validationResult} = require('express-validator')
const bcrypt = require ('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../config/jwtsecret');
const Posts = require('../models/post.model');


exports.signUp = async (req, res, next)=>{
    try {
      const validationErrors = validationResult(req);
      if(!validationErrors.isEmpty()){
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
      res.status(201).send({message: "You are registered! Please LogIn.", user: result})






        
    } catch (err) {
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)
        
    }
}


exports.logIn = async (req, res, next)=>{
    try {
      const email = req.body.email
      const userName = req.body.userName
      const password = req.body.password
     let user;
     if(email){
        user = await User.findOne({email: email})
        if(!user){
            let err = new Error('A user with this email could not be found! Please SignUp')
            err.statusCode = 402
            throw err
        }
     }
      else if(userName){
        user = await User.findOne({userName: userName})
        if(!user){
            let err = new Error('A user with this username could not be found! Please SignUp')
            err.statusCode = 401
            throw err
        }
      }

      const isPasswordEqual = await bcrypt.compare(password, user.password)
      if(!isPasswordEqual){
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
      {expiresIn: '48h'}
      )

      res.status(200).send({token: token, user: user})

        
    } catch (err) {
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)

        
    }
}

exports.getUserProfile =  async (req, res, next)=>{
    try {
        let userId = req.userId
        const result = await User.findById(userId)
        if(!result){
            let err = new Error('user not found')
            err.statusCode = 404
            throw err
        }
        // let userPost = result.posts
        // result.posts = []
        // userPost.posts.forEach(post => {
        //     let currentPost = await Posts.findById(post)
        //     result.posts.push(currentPost)
            
        // });

        res.send(result)
        
    } catch (err) {
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)

        
    }
}

exports.getOneUser = async (req, res, next) =>{
    try {
        let userId = req.params.id
        const result = await User.findById(userId)
        if(!result){
            let err = new Error('user not found')
            err.statusCode = 404
            throw err
        }

        res.send(result)
        
    } catch (err) {
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)

        
    }
}