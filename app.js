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

// middleware



// routes
app.get('/', (req, res) => {
    res.render('home');
});

// hardcoded route to get mongoose established, db created, and seeded
app.get('/makecampground', async (req, res) => {
    const camp = new Campground({
        title: "Blackwater Creek",
        price: "$9.99",
        description: "More of a trail really.",
        location: "Downtown Lynchburg"
    });
    await camp.save();
    res.send(camp);
});

// start server on port 3000 cause why not
app.listen(3000, () => {
    console.log("server port 3000");
});