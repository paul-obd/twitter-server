const Token = require('../models/resetPasswordToken.model')

exports.getOneToken = async (req, res, next)=>{
    try {
        const token = req.params.token
    
        const isToken = await Token.findOne({token: token})
        if(isToken){
            let err = new Error('Link is not available anymore!')
            err.statusCode = 422
            throw err
        }
        else if(!isToken){
            res.send({message: "link is available", available: true})
        }
    } catch (err) {
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)
        
    }
}

exports.addToken = async (req, res, next)=>{
    try {
        const token  = new Token({
            token: req.body.token
        })
      
        const addedToken = await token.save()

        res.send({message: "token added successfully", token: addedToken})
    } catch (err) {
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)
        
        
    }
}