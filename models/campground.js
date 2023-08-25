const mongoose = require('mongoose')
const Review = require('./review')

const Schema = mongoose.Schema

const CampGroundSchema = new Schema({
	title: { type: String, required: true },
	price: { type: Number, required: true },
	location: { type: String, required: true },
	image: { type: String, required: true },
	description: { type: String, required: true },
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Review',
		},
	],
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
