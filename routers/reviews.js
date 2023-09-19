const express = require('express')
const reviewRouter = express.Router({ mergeParams: true })
const review = require('../controllers/review')
const {
	validateReview,
	saveReturnTo,
	isAuthorReview,
} = require('../middleware')

const catchAsync = require('../utils/catchAsync')

const { authenticate } = require('../middleware')

reviewRouter.post(
	'/',
	saveReturnTo((req) => `/campgrounds/${req.params.id}`),
	authenticate,
	validateReview,
	catchAsync(review.create)
)

reviewRouter.delete(
	'/:reviewId',
	authenticate,
	isAuthorReview,
	catchAsync(review.delete)
)

module.exports = reviewRouter
