// Express - import
const express = require('express')
const path = require('path')
const app = express()
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')

// Utils
const ExpressError = require('./utils/ExpressError')

// Tempalte - import
const { engine } = require('express-handlebars')

// Database - import
const mongoose = require('mongoose')
const campgroundRouter = require('./routers/campgrounds')

// Mongoose connect
mongoose
	.connect('mongodb://localhost:27017/yelp-camp')
	.then(() => {
		console.log('Database connected!')
	})
	.catch((err) => {
		console.log('Connection error:')
		console.log(err)
	})

// Session

const WEEK_TO_MINISECONDS = 1000 * 60 * 60 * 24 * 7
const sessionOptions = {
	secret: 'thisshouldbeabettersceret!',
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: WEEK_TO_MINISECONDS,
	},
}
app.use(session(sessionOptions))

// Flash
app.use(flash())

// App setup
app.engine(
	'hbs',
	engine({
		layoutsDir: path.join(__dirname, 'views/layouts'),
		partialsDir: path.join(__dirname, 'views/partials'),
		extname: 'hbs',
		runtimeOptions: {
			allowProtoPropertiesByDefault: true,
		},
	})
)
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.use(express.static(path.join(__dirname, 'public')))
app.use(
	'/bootstrap',
	express.static(path.join(__dirname, '/node_modules/bootstrap/dist/'))
)

app.use(express.static(path.join(__dirname, '/public')))

app.use((req, res, next) => {
	res.locals.message = req.flash('message')[0] || {
		title: 'hehehe',
		text: 'wodjaoidja',
	}
	next()
})

// Route
app.get('/', (req, res) => {
	res.render('home')
})

// Routing
app.use('/campgrounds', campgroundRouter)

app.all('*', (req, res, next) => {
	next(new ExpressError(404, 'Not found'))
})

app.use((err, req, res, next) => {
	const { code = 500, message = 'Something went wrong', stack } = err
	res.render('error', { code, message, stack, nav: true })
})

app.listen(3000, () => {
	console.log('Serving on port 3000!')
})
