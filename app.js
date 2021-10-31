////////////////
// YelpCamp!
////////////////

// dependencies
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
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

// first post request to create a new campground and add to db
app.post('/campgrounds/', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();

    // redirect to the show page for the added campground
    res.redirect(`/campgrounds/${campground._id}`);
});

// make sure to order these routes so that they don't
// prevent later ones from occuring


app.get('/campgrounds/:id', async (req, res) => {
    // see if the request has a good campground
    const campground = await Campground.findById(req.params.id);

    // render show site of this campground
    res.render('campgrounds/show', { campground });
});

app.get('/campgrounds/:id/edit', async (req, res) => {
    // see if the request could find this campground
    const campground = await Campground.findById(req.params.id);

    // render edit site for this campground
    res.render('campgrounds/edit', { campground });
});

app.put('/campgrounds/:id', async (req, res) => {
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
});

// delete route
app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
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

// new branch section41 test

// the course goes:
// section about technology
// section adding that tech to yelpcamp