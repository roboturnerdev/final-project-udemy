const Campground = require('../models/campground');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();

    // redirect to the show page for the added campground
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
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
};

module.exports.renderEditForm = async (req, res) => {
    // see if the request could find this campground
    const campground = await Campground.findById(req.params.id);
    if(!campground) {
        req.flash('error', 'Cannot edit that campground');
        return res.redirect('/campgrounds');
    }
    // render edit site for this campground
    res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async (req, res) => {
    
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
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground removed.');
    res.redirect('/campgrounds');
};