const express = require('express')
const reviewRouter = express.Router({ mergeParams: true })
const {
	validateReview,
	saveReturnTo,
	isAuthorReview,
} = require('../middleware')

const Review = require('../models/review')
const catchAsync = require('../utils/catchAsync')
const CampGround = require('../models/campground')

const { authenticate } = require('../middleware')

reviewRouter.post(
	'/',
	saveReturnTo((req) => `/campgrounds/${req.params.id}`),
	authenticate,
	validateReview,
	catchAsync(async (req, res) => {
		const {
			body,
			params: { id },
		} = req

		const campground = await CampGround.findById(id)
		campground.reviews = campground.reviews || []
		const rv = new Review({ ...body, author: req.user._id })
		campground.reviews.push(rv)
		await rv.save()
		await campground.save()
		res.redirect(`/campgrounds/${id}`)
	})
)

reviewRouter.delete(
	'/:reviewId',
	authenticate,
	isAuthorReview,
	catchAsync(async (req, res) => {
		const { id, reviewId } = req.params

		const campground = await CampGround.findByIdAndUpdate(id, {
			$pull: { reviews: reviewId },
		})

		await Review.findByIdAndDelete(reviewId)
		await campground.save()
		res.redirect(`/campgrounds/${id}`)
	})
)

module.exports = reviewRouter
