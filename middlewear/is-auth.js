const jwt = require('jsonwebtoken')
const jwtSecret = require('../config/jwtsecret')

module.exports = (req, res, next)=>{
    const authHeader = req.get('Authorization');
    if(!authHeader){
        let err = new Error('Not authenticated')
        err.statusCode = 401
        throw err
    }

    const token = authHeader;
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, jwtSecret )

    } catch (err) {
        err.statusCode = 500
        throw err
    }
    if(!decodedToken){
        let err = new Error('Not authenticated')
        err.statusCode = 401
        throw err
    }

    req.userId = decodedToken.userId
    next()
}