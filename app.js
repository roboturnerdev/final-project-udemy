////////////////
// YelpCamp!
////////////////

// environment variables with dotenv
// different in production mode will learn when we deploy
if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// dependencies
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

// connect mongoose and name DB for yelp-camp
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// connect mongoose with error handling
const db = mongoose.connection; // just cleans up the code by naming it db
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// initialize express
const app = express();

// config
// one of many engines, used to parse ejs
app.engine('ejs', ejsMate);         // use the ejs-mate package as our engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

///////////////
// middleware
///////////////

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));


const sessionConfig = {
    secret: "roboturnerdev",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

// make sure this is done before passport.session()
app.use(session(sessionConfig));
app.use(flash());

/////////////
// passport
/////////////
app.use(passport.initialize());
app.use(passport.session());

// passport, use the local strategy
// and for that, use the authenticate method
// on the User model
// model method comes from mongoose as a static method
passport.use(new LocalStrategy(User.authenticate()));

// how to serialize the user
// how do we store a user in the session
passport.serializeUser(User.serializeUser());

// from plugin on mongoose also
// how to get un-store it
passport.deserializeUser(User.deserializeUser());

// flash middleware
app.use((req, res, next) => {
    console.log(req.session);
    res.locals.currentUser = req.user; // currentUser should be available everywhere
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// old feature to make a user
// app.get('/fakeUser', async (req, res) => {
//     const user = new User({
//         email: 'happyman@gmail.com',
//         username: 'happyman'
//     });

//     // hashes the pw, stores it
//     const newUser = await User.register(user, 'password');
//     res.send(newUser);
// });

// note about passport:
// 1. found technology that we wanted to implement
// 2. read docs, install, and link the package
// 3. set up tests and testing so we can
//      a. make sure it works
//      b. think about errors
// 4. plan routing with new tech
//      - with passport we need many various
//        request handlers to login, register, etc.
// 5. iterate on tech in app, customize it for our use

// linking route files
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

// routes
app.get('/', (req, res) => {
    res.render('home');
});

// error handling
app.all('*', (req, res, next) => {
    next(new ExpressError('page no finding', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'No, not this. This is bad';
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    // get server listening 3000
    console.log("Server Port: 3000");
    // antithesis to the 'no-spin zone'
    // we are spinning
    console.log("estamos girando");
});
//
//
//
//
//
// Section 56 - current branch/section
// Robert Turner, 2021
// @robo_turner
// roboturnerdev@gmail.com