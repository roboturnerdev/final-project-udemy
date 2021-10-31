// **********
// YelpCamp!
// **********

// dependencies
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');

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
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

///////////////
// middleware
///////////////

// need to tell express to parse body in requests
app.use(express.urlencoded({ extended: true }));


// routes
app.get('/', (req, res) => {
    res.render('home');
});

// all campgrounds page
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
});

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.post('/campgrounds/', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
});

// place routes above /:id routes so they dont get it before
app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
});



// // hardcoded route to get mongoose established, db created, and seeded
// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({
//         title: "Blackwater Creek",
//         price: "$9.99",
//         description: "More of a trail really.",
//         location: "Downtown Lynchburg"
//     });
//     await camp.save();
//     res.send(camp);
// });

// start server on port 3000 cause why not
app.listen(3000, () => {
    console.log("server port 3000");
});