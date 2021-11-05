module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.flash('error', 'Must be logged in');
        return res.redirect('/login');
    }
    next();
};