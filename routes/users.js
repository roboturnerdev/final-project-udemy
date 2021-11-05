const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res) => {
    try {   
        // destruct these from the request
        const {email, username, password} = req.body;

        // create a user with them
        const user = new User({email, username});

        // register the new user and save the result
        const registeredUser = await User.register(user, password);

        // here we would like passport.authenticate() right
        // but in this situation we can't authenticate until
        // we have created a user. 
        
        // instead we :

        // try to log that user in
        req.login(registeredUser, err => {
            if (err) return next(err);

            // registration + login success logic
            req.flash('success', 'Welcome to the site!');
            res.redirect('/campgrounds');
        });
    } catch(e) {
        // problem registering
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    // passport middleware makes this safe, we know someone got authenticated
    req.flash('success', 'Welcome back!');

    // try the session url or give it a default
    const redirectUrl = req.session.returnTo || '/campgrounds';

    // clean up the session memory
    delete req.session.returnTo;

    // redirect
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Logged you out');
    res.redirect('/campgrounds');
});

module.exports = router;