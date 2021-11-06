const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const Campground = require('../models/campground');

// add routes to router instead
// all campgrounds page
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

// first post request to create a new campground and add to db
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();

    // redirect to the show page for the added campground
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// make sure to order these routes so that they don't
// prevent later ones from occuring

router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({     // populate the reviews
            path: 'reviews',
            populate: {
                path: 'author' // populate the review authors
            }
        })
        .populate('author'); // populate the campground author

    // use log like this to see what campground is after that find
    // now that we have author we can see it on the object
    // console.log(campground);
    if(!campground) {
        req.flash('error', 'No campground with that id');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    // see if the request could find this campground
    const campground = await Campground.findById(req.params.id);
    if(!campground) {
        req.flash('error', 'Cannot edit that campground');
        return res.redirect('/campgrounds');
    }
    // render edit site for this campground
    res.render('campgrounds/edit', { campground });
}));

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    
    // destructure the id from the request
    const { id } = req.params;

    // we referenced this campground in new and edit
    // as an array with properties. because of that
    // we can use the spread operator for the params
    // we want to send in (title, location, etc)
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', "Update successful.");
    // show page of the campground we just created
    res.redirect(`/campgrounds/${campground._id}`);
}));

// delete route
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground removed.');
    res.redirect('/campgrounds');
}));

module.exports = router;