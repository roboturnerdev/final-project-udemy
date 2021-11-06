const User = require('../models/user');

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
};

module.exports.registerUser = async (req, res) => {
    try {  
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
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
};

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
};

module.exports.loginUser = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    // clean up the session memory
    delete req.session.returnTo;
    // redirect
    res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res) => {
    req.logout();
    req.flash('success', 'Logged you out');
    res.redirect('/campgrounds');
};