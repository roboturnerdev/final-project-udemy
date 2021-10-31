// **********
// YelpCamp!
// **********

// dependencies
const express = require('express');
const app = express();
const path = require('path');

// config
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middleware



// routes
app.get('/', (req, res) => {
    res.render('home');
});

// start server on port 3000 cause why not
app.listen(3000, () => {
    console.log("server port 3000");
});