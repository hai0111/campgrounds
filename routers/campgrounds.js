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

campgroundRouter.use('/:id/reviews', reviewRouter)

campgroundRouter.get('/', catchAsync(campground.index))

campgroundRouter.get('/new', authenticate, catchAsync(campground.renderNewForm))

campgroundRouter.get('/:id', catchAsync(campground.detail))

campgroundRouter.get(
	'/:id/update',
	authenticate,
	isAuthorCampground,
	catchAsync(campground.renderUpdateForm)
)

campgroundRouter.put(
	'/:id',
	authenticate,
	isAuthorCampground,
	validateCampground,
	catchAsync(campground.update)
)

campgroundRouter.delete(
	'/:id',
	authenticate,
	isAuthorCampground,
	catchAsync(campground.delete)
)

campgroundRouter.post(
	'/',
	authenticate,
	validateCampground,
	catchAsync(campground.create)
)

campgroundRouter.post('/reset', catchAsync(campground.reset))

module.exports = campgroundRouter
