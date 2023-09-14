const express = require('express')
const reviewRouter = express.Router({ mergeParams: true })
const { validateReview } = require('../middleware')

const Review = require('../models/review')
const catchAsync = require('../utils/catchAsync')
const CampGround = require('../models/campground')

const { authenticate } = require('../middleware')

reviewRouter.post(
	'/',
	authenticate,
	validateReview,
	catchAsync(async (req, res) => {
		const {
			body,
			params: { id },
		} = req

		const campground = await CampGround.findById(id)
		campground.reviews = campground.reviews || []
		const rv = new Review(body)
		campground.reviews.push(rv)
		await rv.save()
		await campground.save()
		res.redirect(`/campgrounds/${id}`)
	})
)

reviewRouter.delete(
	'/:reviewId',
	authenticate,
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
