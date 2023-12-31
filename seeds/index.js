// const mongoose = require('mongoose')
const CampGround = require('../models/campground')

const cities = require('./cities')
const { descriptors, places } = require('./seedHelpers')
const mapbox = require('../mapbox')

// mongoose
// 	.connect('mongodb://localhost:27017/yelp-camp')
// 	.then(() => {
// 		console.log('Database connected!')
// 	})
// 	.catch((err) => {
// 		console.log('Connection error:')
// 		console.log(err)
// 	})

const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
	await CampGround.deleteMany({})
	for (let i = 0; i < 50; i++) {
		const random1000 = Math.floor(Math.random() * 1000)
		const randomPrice = Math.floor(Math.random() * 10) + 20
		const city = cities[random1000]
		const location = `${city.city} , ${city.state}`
		const c = new CampGround({
			author: null,
			location,
			geometry: {
				type: 'Point',
				coordinates: [city.longitude, city.latitude],
			},
			title: `${sample(descriptors)} ${sample(places)}`,
			description:
				'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Id provident suscipit iusto nostrum. Quis itaque necessitatibus natus, similique error harum provident ab, dolore ad, obcaecati doloremque at beatae? Minus, autem.',
			images: [
				{
					url: 'https://source.unsplash.com/collection/9046579',
				},
			],
			price: randomPrice,
			reviews: [],
		})
		c.save()
	}
}

module.exports = seedDB
