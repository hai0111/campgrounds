const Campground = require('../models/campground')
const ExpressError = require('../utils/ExpressError')
const CampGround = require('../models/campground')
const seedDB = require('../seeds')

module.exports.index = async (req, res) => {
	const camps = await Campground.find({})
	camps.forEach((item) => {
		item.thumnail = item.images[0]?.url
	})

	res.render('campgrounds', {
		camps,
		title: 'All campgrounds',
		nav: true,
	})
}

module.exports.renderNewForm = async (req, res) => {
	res.render('campgrounds/new', {
		nav: true,
	})
}

module.exports.detail = async (req, res) => {
	const { id } = req.params
	if (!id) return
	const camp = await CampGround.findById(id).populate({
		path: 'reviews',
		populate: {
			path: 'author',
		},
	})

	camp?.reviews.forEach((rv) => {
		rv.isAuthor = req.user?.id && rv.author?.equals(req.user?.id)
	})

	if (!camp) throw new ExpressError(404, 'Campground not found')

	res.locals.isAuthor = req.user && camp.author?.id === req.user?.id
	res.render('campgrounds/detail', { camp, title: camp?.title, nav: true })
}
module.exports.renderUpdateForm = async (req, res) => {
	const { id } = req.params
	const camp = await CampGround.findById(id)
	res.render('campgrounds/update', {
		camp,
		title: `Update ${camp?.title}`,
		nav: true,
	})
}
module.exports.update = async (req, res) => {
	const { id } = req.params

	await CampGround.findByIdAndUpdate(id, req.body).then((camp) => camp.save())

	req.flash('message', {
		type: 'success',
		text: 'Update completed successfully',
	})
	res.redirect(`/campgrounds/${id}`)
}
module.exports.delete = async (req, res) => {
	const { id } = req.params

	await CampGround.findByIdAndDelete(id)

	req.flash('message', {
		type: 'success',
		text: 'Delete completed successfully',
	})
	res.redirect('/campgrounds')
}
module.exports.create = async (req, res) => {
	const { body } = req
	const c = new CampGround({ ...body, author: req.user._id })
	c.images = req.files.map((f) => ({ url: f.path, filename: f.originalname }))
	await c.save()
	req.flash('message', {
		type: 'success',
		text: 'Create completed successfully',
	})

	res.redirect(`/campgrounds/${c._id}`)
}

module.exports.reset = async (req, res) => {
	await seedDB()
	res.redirect('/campgrounds')
}
