const Campground = require('../models/campground')
const Review = require('../models/review')

module.exports.create = async (req, res) => {
	const {
		body,
		params: { id },
	} = req

	const campground = await Campground.findById(id)
	campground.reviews = campground.reviews || []
	const rv = new Review({ ...body, author: req.user._id })
	campground.reviews.push(rv)
	await rv.save()
	await campground.save()
	res.redirect(`/campgrounds/${id}`)
}

module.exports.delete = async (req, res) => {
	const { id, reviewId } = req.params
	const campground = await Campground.findByIdAndUpdate(id, {
		$pull: { reviews: reviewId },
	})

	await Review.findByIdAndDelete(reviewId)
	await campground.save()
	res.redirect(`/campgrounds/${id}`)
}
