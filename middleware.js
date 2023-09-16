const ExpressError = require('./utils/ExpressError')
const { camgroundSchema, userSchema, reviewSchema } = require('./schemas')
const Campground = require('./models/campground')

module.exports.saveReturnTo = (path) => (req, res, next) => {
	req.session.returnTo = typeof path === 'string' ? path : path(req)
	next()
}

module.exports.authenticate = (req, res, next) => {
	if (!req.isAuthenticated() && req.path !== '/login') {
		req.session.returnTo = req.session.returnTo || req.originalUrl

		req.flash('toast', {
			type: 'danger',
			message: 'You must be signed in',
		})
		return res.redirect('/login')
	}
	next()
}

module.exports.validateUser = (req, res, next) => {
	const { body } = req
	const resultValidate = userSchema.validate(body, { abortEarly: false })
	if (resultValidate.error) {
		throw new ExpressError(
			400,
			resultValidate.error.details.map((item) => item.message).join()
		)
	} else next()
}

module.exports.validateCampground = (req, res, next) => {
	const { body } = req
	const resultValidate = camgroundSchema.validate(body, { abortEarly: false })
	if (resultValidate.error) {
		throw new ExpressError(
			400,
			resultValidate.error.details.map((item) => item.message).join()
		)
	} else next()
}

module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params
	const camp = await Campground.findById(id)
	if (!camp.author.equals(req.user?.id)) {
		return res.redirect(`/campgrounds/${id}`)
	}
	next()
}

module.exports.validateReview = (req, res, next) => {
	const { body } = req
	const resultValidate = reviewSchema.validate(body, { abortEarly: false })
	if (resultValidate.error) {
		throw new ExpressError(
			400,
			resultValidate.error.details.map((item) => item.message).join()
		)
	} else next()
}
