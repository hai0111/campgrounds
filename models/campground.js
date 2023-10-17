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

const CampGroundSchema = new Schema({
	title: { type: String, required: true },
	price: { type: Number, required: true },
	location: { type: String, required: true },
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
		})
	}
})

module.exports = mongoose.model('CampGround', CampGroundSchema)
