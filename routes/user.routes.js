const express = require('express')
const route = express.Router();
const { body } = require('express-validator')
const User = require('../models/user.model');
const userController = require('../controllers/user.controller')

const isAuth = require('../middlewear/is-auth')

route.post('/signup', [
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .custom((value, {req, res, next})=>{
        return User.findOne({email: value}).then(user =>{
            if(user){
                return Promise.reject('E-mail already exists!')
             //  let err = new Error('E-mail already exists!')
              // err.statusCode = 404
              // next(err)
            }
        })
    }),
   // .normalizeEmail(),
    body('userName')
    .trim()
    .isLength({min: 2})
    .withMessage('Password should be at least 6 characters please!')
    .custom((value, {req})=>{
        return User.findOne({userName: value}).then(user =>{
            if(user){
                // let err = new Error('Username already exists! Kindly try another one.')
                // err.statusCode = 404
                // next(err)
                return Promise.reject('Username already exists! Kindly try another one.')
            }
        })
    })
    .not()
    .isEmpty(),
    body('password')
    .trim()
    .isLength({min: 6})
    .withMessage('Password should be at least 6 characters please!')
],
    userController.signUp
)


route.post('/login', userController.logIn)




route.get('/profile', isAuth, userController.getOneUser )


module.exports = route
