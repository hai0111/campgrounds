const User = require('../models/user')

module.exports.renderRegisterForm = (req, res) => {
	res.render('auth/register', {
		nav: true,
	})
}

module.exports.register = async (req, res) => {
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
			const { returnTo = '/campgrounds' } = res.locals
			delete req.session.returnTo
			return res.redirect(returnTo)
		}

		req.flash('toast', {
			message: 'Registered successfully',
			type: 'success',
		})

		res.redirect('/login')
	})
}

module.exports.renderLoginForm = (req, res) => {
	if (req.user) return res.redirect('/campgrounds')

	res.render('auth/login', {
		nav: true,
	})
}

module.exports.loginSuccess = (req, res) => {
	req.flash('toast', {
		message: 'Welcome to campgrounds!',
		type: 'success',
	})

	const { returnTo = '/campgrounds' } = res.locals
	delete req.session.returnTo
	return res.redirect(returnTo)
}

module.exports.logout = (req, res, next) => {
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
}
