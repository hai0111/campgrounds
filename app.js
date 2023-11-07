if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
}

const express = require('express')
const path = require('path')
const app = express()
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')
const mongoose = require('mongoose')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')

const ExpressError = require('./utils/ExpressError')

const { engine } = require('express-handlebars')

const campgroundRouter = require('./routers/campgrounds')
const authRouter = require('./routers/auth')

mongoose
	.connect('mongodb://localhost:27017/yelp-camp')
	.then(() => {
		console.log('Database connected!')
	})
	.catch((err) => {
		console.log('Connection error:')
		console.log(err)
	})

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

// Mapbox
app.use(
	'/mapbox-gl',
	express.static(path.join(__dirname, '/node_modules/mapbox-gl/dist/'))
)

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
app.use(flash())

passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
	res.locals.returnTo = req.session.returnTo
	res.locals.user = req.user
	res.locals.toast = req.flash('toast')[0]
	next()
})

app.use(express.static(path.join(__dirname, '/public')))

app.get('/', (req, res) => {
	res.render('home')
})

app.get('/fakeUser', async (req, res) => {
	const user = new User({
		email: 'nguyenhai01101@gmail.com',
		username: 'nvhai',
	})

	const newUser = await User.register(user, 'nvhai')

	res.send(newUser)
})

app.use('/', authRouter)
app.use('/campgrounds', campgroundRouter)

app.use('*', (req, res, next) => {
	next(new ExpressError(404, 'Not found'))
})

app.use((err, req, res, next) => {
	const { code = 500, message = 'Something went wrong', stack, errToast } = err
	if (errToast)
		req.flash('toast', {
			type: 'danger',
			message: `${code}: ${message}`,
		})
	else res.locals.toast = undefined
	res.render('error', { code, message, stack, nav: true })
})

app.listen(3000, () => {
	console.log('Serving on port 3000!')
})
