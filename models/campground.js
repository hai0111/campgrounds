const mongoose = require('mongoose')
const Review = require('./review')

const Schema = mongoose.Schema

const ImageSchema = new Schema({
	url: String,
	filename: String,
})

ImageSchema.virtual('thumnail').get(function () {
	return this.url.replace('upload/', 'upload/c_fill,w_300/')
})

const opts = { toJSON: { virtuals: true } }

const CampGroundSchema = new Schema(
	{
		title: { type: String, required: true },
		price: { type: Number, required: true },
		location: {
			type: String,
			required: true,
		},
		geometry: {
			type: {
				type: String,
				enum: ['Point'],
				required: true,
			},
			coordinates: {
				type: [Number],
				required: true,
			},
		},
		images: [ImageSchema],
		description: { type: String, required: true },
		reviews: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Review',
			},
		],
		author: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	opts
)

CampGroundSchema.virtual('properties.markupPopup').get(function () {
	return `<a href="/campgrounds/${this._id}"><h6>${this.title}</h6></a>${this.description}`
})

CampGroundSchema.post('findOne', async (camp) => {
	if (camp) await camp.populate('author')
})

CampGroundSchema.post('findOneAndDelete', async (doc) => {
	if (doc) {
		await Review.deleteMany({
			_id: {
				$in: doc.reviews,
			},
		})``
	}
})

module.exports = mongoose.model('CampGround', CampGroundSchema)
