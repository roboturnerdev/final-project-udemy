////////////////
// YelpCamp!
////////////////

// dependencies
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

// connect mongoose and name DB for yelp-camp
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
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

// need to tell express to parse body in requests
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

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
// Section 49 - current branch/section
// Robert Turner, 2021
// @robo_turner
// roboturnerdev@gmail.com