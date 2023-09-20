const express = require('express')

const catchAsync = require('../utils/catchAsync')

const campground = require('../controllers/campground')

// Utils
const reviewRouter = require('./reviews')
const {
	authenticate,
	isAuthorCampground,
	validateCampground,
} = require('../middleware')

const campgroundRouter = express.Router()

campgroundRouter
	.route('/')
	.get(catchAsync(campground.index))
	.post(authenticate, validateCampground, catchAsync(campground.create))

campgroundRouter.get('/new', authenticate, catchAsync(campground.renderNewForm))

campgroundRouter.post('/reset', catchAsync(campground.reset))

campgroundRouter
	.route('/:id')
	.get(catchAsync(campground.detail))
	.put(
		authenticate,
		isAuthorCampground,
		validateCampground,
		catchAsync(campground.update)
	)
	.delete(authenticate, isAuthorCampground, catchAsync(campground.delete))

campgroundRouter.use('/:id/reviews', reviewRouter)

campgroundRouter.get(
	'/:id/update',
	authenticate,
	isAuthorCampground,
	catchAsync(campground.renderUpdateForm)
)

module.exports = campgroundRouter
