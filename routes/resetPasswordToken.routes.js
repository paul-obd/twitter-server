const express = require('express')
const route = express.Router()
const resetPasswordTokenController = require('../controllers/resetPasswordToken.controller')

route.get('/one-token/:token', resetPasswordTokenController.getOneToken)

route.post('/add-token', resetPasswordTokenController.addToken)

module.exports = route