const express = require('express')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const auth = require('../controllers/auth')
const { validateUser } = require('../middleware')
const authRouter = express.Router()

authRouter.get('/register', auth.renderRegisterForm)

authRouter.post('/register', validateUser, catchAsync(auth.register))

authRouter.get('/login', auth.renderLoginForm)

authRouter.post(
	'/login',
	passport.authenticate('local', {
		failureRedirenect: '/login',
		failureFlash: true,
	}),
	auth.loginSuccess
)

authRouter.get('/logout', auth.logout)

module.exports = authRouter
