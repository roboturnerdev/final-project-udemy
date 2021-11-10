// Campground model

const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

// Campground Schema

const opts = { 
    toJSON: {
        virtuals: true
    }
};

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);   // by default mongoose doesnt use virtuals when you stringify to JSON
// these options make it do that

// look into virtual properties. this is allowing me to use
// the same schema i have right now, but be compliant with mapbox
// mapbox wants a property called properties. the way mapbox
// loads the geojson data objects in has the rest of the access
// given only to the "properties" property of the campground
// virtual properties let us do that

// we can also modify the popup markup here
CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<a href="/campgrounds/${this._id}">${this.title}</a>
    <p>${this.description.substring(0,20)}...</p>`
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }   // mongoose function
        })
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);