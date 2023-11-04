import '/mapbox-gl/mapbox-gl.js'

mapboxgl.accessToken = MAPBOX_TOKEN

const map = new mapboxgl.Map({
	container: 'map', // container ID
	// Choose from Mapbox's core styles, or make your own style with Mapbox Studio
	style: 'mapbox://styles/mapbox/streets-v12', // style URL
	center: geometry, // starting position [lng, lat]
	zoom: 12, // starting zoom,
})

const popup = new mapboxgl.Popup({ maxWidth: 500, closeOnMove: true }).setHTML(
	`
<h6>${title}</h6>
<p>${description}</p> 
`
)

new mapboxgl.Marker({ color: 'blue' })
	.setLngLat(geometry)
	.setPopup(popup)
	.addTo(map)
