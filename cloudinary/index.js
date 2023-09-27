const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_SECRET,
})

const storage = new CloudinaryStorage({
	cloudinary,
	params: {
		folder: 'yelp_camp',
		format: (req, file) => {
			return file.originalname.match(/(?<=\.)\w+$/)[0]
		},
		public_id: (req, file) => {
			return file.originalname.match(/^.+(?=\.\w+$)/)[0]
		},
	},
})

const parser = multer({ storage })

module.exports = parser
