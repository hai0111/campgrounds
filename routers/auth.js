const express = require('express')
const catchAsync = require('../utils/catchAsync')
const User = require('../models/user')
const { userSchema } = require('../schemas')
const authRouter = express.Router()
const ExpressError = require('../utils/ExpressError')

authRouter.get('/register', (req, res) => {
	res.render('auth/register', {
		nav: true,
	})
})

const validateUser = (req, res, next) => {
	const { body } = req
	const resultValidate = userSchema.validate(body, { abortEarly: false })
	if (resultValidate.error) {
		throw new ExpressError(
			400,
			resultValidate.error.details.map((item) => item.message).join()
		)
	} else next()
}

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

		req.flash('toast', {
			message: 'Registered successfully',
			type: 'success',
		})

		res.redirect('/campgrounds')
	})
)

module.exports = authRouter
