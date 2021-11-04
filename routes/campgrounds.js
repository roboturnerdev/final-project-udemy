const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { campgroundSchema } = require('../schemas.js');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');

const validateCampground = (req, res, next) => {
     const { error } = campgroundSchema.validate(req.body);
     if(error) {
         const msg = error.details.map(el => el.message).join(',');
         throw new ExpressError(msg, 400);
     } else {
         next();
     }
};

// add routes to router instead
// all campgrounds page
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

router.get('/new', (req, res) => {
    res.render('campgrounds/new');
});

// first post request to create a new campground and add to db
router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();

    // redirect to the show page for the added campground
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// make sure to order these routes so that they don't
// prevent later ones from occuring

router.get('/:id', catchAsync(async (req, res) => {
    // see if the request has a good campground
    const campground = await Campground.findById(req.params.id).populate('reviews');
    // render show site of this campground
    res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    // see if the request could find this campground
    const campground = await Campground.findById(req.params.id);

    // render edit site for this campground
    res.render('campgrounds/edit', { campground });
}));

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
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
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

module.exports = router;