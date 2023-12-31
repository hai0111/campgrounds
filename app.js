const dotenv = require('dotenv')

const isDev = process.env.NODE_ENV.trim() === 'development'
const pathEnv = isDev ? '.env.dev' : '.env.prd'
dotenv.config({ path: pathEnv })

const express = require('express')
const path = require('path')
const app = express()
const flash = require('connect-flash')
const mongoose = require('mongoose')
const passport = require('passport')
const helmet = require('helmet')
const LocalStrategy = require('passport-local')
const User = require('./models/user')

const methodOverride = require('method-override')

const ExpressError = require('./utils/ExpressError')

const { engine } = require('express-handlebars')

const campgroundRouter = require('./routers/campgrounds')
const authRouter = require('./routers/auth')

// Security
const connectSrcs = ['https://api.mapbox.com', 'https://events.mapbox.com']
const scriptSrcs = ['cdn.jsdelivr.net', 'blob:']
const imgSrcs = ['https:', 'data:']

app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: [],
				connectSrc: ["'self'", ...connectSrcs],
				scriptSrc: ["'self'", ...scriptSrcs],
				imgSrc: ["'self'", ...imgSrcs],
			},
		},
	})
)

mongoose
	.connect(process.env.MONGODB_CONNECT_URL)
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

const session = require('express-session')
const MongoStore = require('connect-mongo')

const store = MongoStore.create({
	mongoUrl: process.env.MONGODB_CONNECT_URL,
	touchAfter: 24 * 60 * 60,
})

store.on('error', (err) => {
	console.log('MONGO SESSION STORE WAS WRONG', err)
})

const WEEK_TO_MINISECONDS = 1000 * 60 * 60 * 24 * 7
const sessionOptions = {
	store,
	secret: 'thisshouldbeabettersceret!',
	saveUninitialized: false,
	resave: false,
	cookie: {
		maxAge: WEEK_TO_MINISECONDS,
	},
}

// Sanitize
const mongoSanitize = require('express-mongo-sanitize')
app.use(mongoSanitize())
app.use(session(sessionOptions))
app.use(flash())

passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
	res.locals.isDev = isDev
	res.locals.returnTo = req.session.returnTo
	res.locals.user = req.user
	res.locals.toast = req.flash('toast')[0]
	next()
})

app.use(express.static(path.join(__dirname, '/public')))

app.get('/', (req, res) => {
	res.render('home', { customLayout: true })
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
