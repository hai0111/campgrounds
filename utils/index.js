const mapbox = require('../mapbox')

module.exports.getGeocode = async (location) => {
	const geocodeResponse = await mapbox
		.forwardGeocode({
			query: location,
			limit: 1,
		})
		.send()

	const { geometry } = geocodeResponse.body.features[0]
	return geometry
}
