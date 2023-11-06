import '/mapbox-gl/mapbox-gl.js'
let camps = JSON.parse(document.querySelector('data').dataset.camps)

camps = camps.map((c) => {
	const { geometry, ...properties } = c
	return { geometry, properties }
})

mapboxgl.accessToken =
	'pk.eyJ1IjoibnZoYWkiLCJhIjoiY2xua2hkdmNnMTRjejJrbWpxemN3dDR0NSJ9.1xw26a3_78WmCD5oiym55w'
const map = new mapboxgl.Map({
	container: 'map',
	// Choose from Mapbox's core styles, or make your own style with Mapbox Studio
	style: 'mapbox://styles/mapbox/light-v11',
	center: [-103.5917, 40.6699],
	zoom: 3,
})

map.on('load', () => {
	// Add a new source from our GeoJSON data and
	// set the 'cluster' option to true. GL-JS will
	// add the point_count property to your source data.
	map.addSource('campgrounds', {
		type: 'geojson',
		// Point to GeoJSON data. This example visualizes all M1.0+ campgrounds
		// from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
		data: {
			features: camps,
		},
		cluster: true,
		clusterMaxZoom: 14, // Max zoom to cluster points on
		clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
	})

	map.addLayer({
		id: 'clusters',
		type: 'circle',
		source: 'campgrounds',
		filter: ['has', 'point_count'],
		paint: {
			// Use step expressions (https://docs.mapbox.com/style-spec/reference/expressions/#step)
			// with three steps to implement three types of circles:
			//   * Blue, 20px circles when point count is less than 100
			//   * Yellow, 30px circles when point count is between 100 and 750
			//   * Pink, 40px circles when point count is greater than or equal to 750
			'circle-color': [
				'step',
				['get', 'point_count'],
				'#51bbd6',
				5,
				'#f1f075',
				10,
				'#f28cb1',
			],
			'circle-radius': ['step', ['get', 'point_count'], 20, 5, 30, 10, 40],
		},
	})

	map.addLayer({
		id: 'cluster-count',
		type: 'symbol',
		source: 'campgrounds',
		filter: ['has', 'point_count'],
		layout: {
			'text-field': ['get', 'point_count_abbreviated'],
			'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
			'text-size': 12,
		},
	})

	map.addLayer({
		id: 'unclustered-point',
		type: 'circle',
		source: 'campgrounds',
		filter: ['!', ['has', 'point_count']],
		paint: {
			'circle-color': '#11b4da',
			'circle-radius': 8,
			'circle-stroke-width': 1,
			'circle-stroke-color': '#fff',
		},
	})

	// inspect a cluster on click
	map.on('click', 'clusters', (e) => {
		const features = map.queryRenderedFeatures(e.point, {
			layers: ['clusters'],
		})
		const clusterId = features[0].properties.cluster_id
		map
			.getSource('campgrounds')
			.getClusterExpansionZoom(clusterId, (err, zoom) => {
				if (err) return
				map.easeTo({
					center: features[0].geometry.coordinates,
					zoom: zoom,
				})
			})
	})

	// When a click event occurs on a feature in
	// the unclustered-point layer, open a popup at
	// the location of the feature, with
	// description HTML from its properties.
	map.on('click', 'unclustered-point', (e) => {
		const coordinates = e.features[0].geometry.coordinates.slice()
		const title = e.features[0].properties.title
		const description = e.features[0].properties.description

		// Ensure that if the map is zoomed out such that
		// multiple copies of the feature are visible, the
		// popup appears over the copy being pointed to.
		while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
		}

		new mapboxgl.Popup()
			.setLngLat(coordinates)
			.setHTML(`<h6>${title}</h6>${description}`)
			.addTo(map)
	})

	map.on('mouseenter', 'clusters', () => {
		map.getCanvas().style.cursor = 'pointer'
	})
	map.on('mouseleave', 'clusters', () => {
		map.getCanvas().style.cursor = ''
	})
})
