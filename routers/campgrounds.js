const express = require('express')

const catchAsync = require('../utils/catchAsync')

// Utils
const ExpressError = require('../utils/ExpressError')

const CampGround = require('../models/campground')
const seedDB = require('../seeds')
const { camgroundSchema } = require('../schemas')
const reviewRouter = require('./reviews')

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
	catchAsync(async (req, res) => {
		res.render('campgrounds/new', {
			nav: true,
		})
	})
)

campgroundRouter.get(
	'/:id/update',
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

campgroundRouter.get(
	'/:id',
	catchAsync(async (req, res) => {
		const { id } = req.params
		const camp = await CampGround.findById(id).populate('reviews')
		if (!camp) throw new ExpressError(404, 'Campground not found')

		res.render('campgrounds/detail', { camp, title: camp?.title, nav: true })
	})
)

campgroundRouter.put(
	'/:id',
	validateCampground,
	catchAsync(async (req, res) => {
		const { id } = req.params
		const camp = await CampGround.findByIdAndUpdate(id, req.body)
		await camp.save()
		res.redirect(`/campgrounds/${id}`)
	})
)

campgroundRouter.delete(
	'/:id',
	catchAsync(async (req, res) => {
		const { id } = req.params
		await CampGround.findByIdAndDelete(id)
		res.redirect('/campgrounds')
	})
)

campgroundRouter.post(
	'/',
	validateCampground,
	catchAsync(async (req, res) => {
		const { body } = req
		const c = new CampGround(body)
		await c.save()
		res.redirect(`/camgrounds/${c.id}`)
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
