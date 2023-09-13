module.exports.authenticate = (req, res, next) => {
	if (!req.isAuthenticated() && req.path !== '/login') {
		req.flash('toast', {
			type: 'danger',
			message: 'You must be signed in',
		})
		return res.redirect('/login')
	}
	next()
}
