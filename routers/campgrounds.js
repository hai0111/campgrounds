const express = require('express')

const catchAsync = require('../utils/catchAsync')

// Utils
const ExpressError = require('../utils/ExpressError')

const CampGround = require('../models/campground')
const seedDB = require('../seeds')
const { camgroundSchema } = require('../schemas')
const reviewRouter = require('./reviews')
const { authenticate } = require('../middleware')

const validateCampground = (req, res, next) => {
	const { body } = req
	const resultValidate = camgroundSchema.validate(body, { abortEarly: false })
	if (resultValidate.error) {
		throw new ExpressError(
			400,
			resultValidate.error.details.map((item) => item.message).join()
		)
	} else next()
}

const authorization = async (req, res, next) => {
	const { id } = req.params
	const camp = await CampGround.findById(id)
	if (!camp.author.equals(req.user?.id)) {
		return res.redirect(`/campgrounds/${id}`)
	}
	next()
}

const campgroundRouter = express.Router()

campgroundRouter.use('/:id/reviews', reviewRouter)

campgroundRouter.get(
	'/',
	catchAsync(async (req, res) => {
		const camps = await CampGround.find({})
		res.render('campgrounds', {
			camps,
			title: 'All campgrounds',
			nav: true,
		})
	})
)

campgroundRouter.get(
	'/new',
	authenticate,
	catchAsync(async (req, res) => {
		res.render('campgrounds/new', {
			nav: true,
		})
	})
)

campgroundRouter.get(
	'/:id',
	catchAsync(async (req, res) => {
		const { id } = req.params
		if (!id) return
		const camp = await CampGround.findById(id).populate('reviews')

		if (!camp) throw new ExpressError(404, 'Campground not found')

		res.locals.isAuthor = req.user && camp.author?.id === req.user?.id
		res.render('campgrounds/detail', { camp, title: camp?.title, nav: true })
	})
)

campgroundRouter.get(
	'/:id/update',
	authenticate,
	authorization,
	catchAsync(async (req, res) => {
		const { id } = req.params
		const camp = await CampGround.findById(id)
		res.render('campgrounds/update', {
			camp,
			title: `Update ${camp?.title}`,
			nav: true,
		})
	})
)

campgroundRouter.put(
	'/:id',
	authenticate,
	authorization,
	validateCampground,
	catchAsync(async (req, res) => {
		const { id } = req.params

		await CampGround.findByIdAndUpdate(id, req.body).then((camp) => camp.save())

		req.flash('message', {
			type: 'success',
			text: 'Update completed successfully',
		})
		res.redirect(`/campgrounds/${id}`)
	})
)

campgroundRouter.delete(
	'/:id',
	authenticate,
	authorization,
	catchAsync(async (req, res) => {
		const { id } = req.params

		await CampGround.findByIdAndDelete(id)

		req.flash('message', {
			type: 'success',
			text: 'Delete completed successfully',
		})
		res.redirect('/campgrounds')
	})
)

campgroundRouter.post(
	'/',
	authenticate,
	validateCampground,
	catchAsync(async (req, res) => {
		const { body } = req
		const c = new CampGround({ ...body, author: req.user._id })
		await c.save()
		req.flash('message', {
			type: 'success',
			text: 'Create completed successfully',
		})

		res.redirect(`/campgrounds/${c._id}`)
	})
)

campgroundRouter.post(
	'/reset',
	catchAsync(async (req, res) => {
		await seedDB()
		res.redirect('/campgrounds')
	})
)

module.exports = campgroundRouter
