const express = require('express')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const User = require('../models/user')
const { validateUser } = require('../middleware')
const authRouter = express.Router()

authRouter.get('/register', (req, res) => {
	res.render('auth/register', {
		nav: true,
	})
})

authRouter.post(
	'/register',
	validateUser,
	catchAsync(async (req, res) => {
		const { username, email, password } = req.body
		const user = new User({
			username,
			email,
		})
		await User.register(user, password)

		req.login(user, (err) => {
			if (!err) {
				req.flash('toast', {
					message: 'Welcome to campgrounds!',
					type: 'success',
				})
				const { returnTo = '/campgrounds' } = req.session
				delete req.session.returnTo
				return res.redirect(returnTo)
			}

			req.flash('toast', {
				message: 'Registered successfully',
				type: 'success',
			})

			res.redirect('/login')
		})
	})
)

authRouter.get('/login', (req, res) => {
	if (req.user) return res.redirect('/campgrounds')

	res.render('auth/login', {
		nav: true,
	})
})

authRouter.post(
	'/login',
	passport.authenticate('local', {
		failureRedirenect: '/login',
		failureFlash: true,
	}),
	(req, res) => {
		req.flash('toast', {
			message: 'Welcome to campgrounds!',
			type: 'success',
		})
		const { returnTo = '/campgrounds' } = res.locals
		delete req.session.returnTo
		return res.redirect(returnTo)
	}
)

authRouter.get('/logout', (req, res, next) => {
	req.logout((err) => {
		if (err) {
			return next(err)
		}
		req.flash('toast', {
			message: 'See you again',
			type: 'success',
		})

		return res.redirect('/login')
	})
})

module.exports = authRouter
