const express = require('express')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const auth = require('../controllers/auth')
const { validateUser } = require('../middleware')
const authRouter = express.Router()

authRouter
	.route('/register')
	.get(auth.renderRegisterForm)
	.post(validateUser, catchAsync(auth.register))

authRouter
	.route('/login')
	.get(auth.renderLoginForm)
	.post(
		passport.authenticate('local', {
			failureRedirenect: '/login',
			failureFlash: true,
		}),
		auth.loginSuccess
	)

authRouter.get('/logout', auth.logout)

module.exports = authRouter
