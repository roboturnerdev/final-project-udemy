////////////////
// YelpCamp!
////////////////

// dependencies
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');

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

const validateCampground = (req, res, next) => {
    // new more explicit error handing with
    // Joi validation
    // helps even if the client-side validation doesnt stop
    // the problem
    // i.e., postman sending post requests with missing stuff
    // skips the form submit preventative error handling
   
     const { error } = campgroundSchema.validate(req.body);
     if(error) {
         const msg = error.details.map(el => el.message).join(',');
         throw new ExpressError(msg, 400);
     } else {
         next();
     }
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

// routes
app.get('/', (req, res) => {
    res.render('home');
});

// all campgrounds page
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

// first post request to create a new campground and add to db
app.post('/campgrounds/', validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid campground data dewd', 400);
    
    const campground = new Campground(req.body.campground);
    await campground.save();
    // redirect to the show page for the added campground
    res.redirect(`/campgrounds/${campground._id}`);
}));

// make sure to order these routes so that they don't
// prevent later ones from occuring


app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    // see if the request has a good campground
    const campground = await Campground.findById(req.params.id).populate('reviews');
    // render show site of this campground
    res.render('campgrounds/show', { campground });
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    // see if the request could find this campground
    const campground = await Campground.findById(req.params.id);

    // render edit site for this campground
    res.render('campgrounds/edit', { campground });
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    // res.send("IT WORKED!");
    // we know adding the method-override worked for the put request
    
    // destructure the id from the request
    const { id } = req.params;
    
    // we referenced this campground in new and edit
    // as an array with properties. because of that
    // we can use the spread operator for the params
    // we want to send in (title, location, etc)
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    
    // show page of the campground we just created
    res.redirect(`/campgrounds/${campground._id}`);
}));

// delete route
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

// initial route for post request
// submit review to db and add review to campground
// save both
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

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


// Section 46
// Robert Turner, 2021
// @robo_turner
// roboturnerdev@gmail.com