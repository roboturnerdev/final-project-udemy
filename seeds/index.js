// this is script is self contained
// run this file on its own whenever we want to
// seed our DB
// maybe changes to the model, etc

// dependencies
const mongoose = require('mongoose');

// models
const cities = require('./cities');
// destruct into named variables
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

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

// single line implicit return
// function: to return a random sample
// accessing the array
// so we can cleanly use it in the loop creating 50 seeds
const sample = (array) => array[Math.floor(Math.random() * array.length)];


// function: to clear db and reseed
const seedDB = async() => {
    // await promise from selecting all
    // and clearing seed so all are new
    await Campground.deleteMany({});

    // // try to make one and see if its connected
    // const c = new Campground({title: 'purple field' });
    // await c.save();

    // setup 50 random seeds
    for(let i = 0; i < 50; i++) {
        // random 1000 cities in the seed
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;

        // make a new campground with random city and state
        const camp = new Campground({
            author: '61848751f2807f3b323ca0eb',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/155011',
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eius quis veniam a distinctio laborum. Sit modi numquam itaque aspernatur, odio ducimus. Minima vitae nisi fugiat sequi nostrum beatae, cum aut? Maxime qui praesentium, ea corporis deserunt error iure id rerum, esse, possimus quod tempora exercitationem nostrum. Officia iusto, delectus vitae fuga voluptatibus, quaerat architecto saepe quos earum cupiditate facere ullam?',
            price
        });
        // the url for the image is an api from unsplash
        // allows me to retrieve random images from 
        // that collection, as a url source
        // right now it does not save the image
        // to the campground, just assigns
        // the source to the one giving random images
        // eventually we will assign img per camp

        // async function to await the promise
        // response from the server about saving item
        await camp.save();
    } // end of loop
};

// the below calls the seedDB function,
// creates a fresh set of 50 seeds in the db
// with promise returned from async,
// we can tell it to close the mongoose db after
seedDB().then(() => {
    mongoose.connection.close();
});