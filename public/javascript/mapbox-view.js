import '/mapbox-gl/mapbox-gl.js'
console.log(geometry)

mapboxgl.accessToken = MAPBOX_TOKEN

const map = new mapboxgl.Map({
	container: 'map', // container ID
	// Choose from Mapbox's core styles, or make your own style with Mapbox Studio
	style: 'mapbox://styles/mapbox/streets-v12', // style URL
	center: geometry, // starting position [lng, lat]
	zoom: 12, // starting zoom,
})

new mapboxgl.Marker({ color: 'blue' }).setLngLat(geometry).addTo(map)
