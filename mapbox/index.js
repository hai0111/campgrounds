const mapboxSDK = require('@mapbox/mapbox-sdk/services/geocoding')

const mapbox = mapboxSDK({
	accessToken: process.env.MAPBOX_TOKEN,
})

module.exports = mapbox
