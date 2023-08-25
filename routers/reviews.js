const express = require('express')
const { reviewSchema } = require('../schemas')
const reviewRouter = express.Router({ mergeParams: true })
const Review = require('../models/review')
const catchAsync = require('../utils/catchAsync')
const CampGround = require('../models/campground')

const validateReview = (req, res, next) => {
	const { body } = req
	const resultValidate = reviewSchema.validate(body, { abortEarly: false })
	if (resultValidate.error) {
		throw new ExpressError(
			400,
			resultValidate.error.details.map((item) => item.message).join()
		)
	} else next()
}

reviewRouter.post(
	'/',
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
