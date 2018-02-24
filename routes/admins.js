var express = require('express');
var router = express.Router();
var csrf = require('csurf');

var Admin = require('../models/admin');

var csrfProtection = csrf();
router.use(csrfProtection);


router.get('/signup', function(req, res, next) {
    res.render('admin/signup', {csrfToken: req.csrfToken()});
});

router.post('/signup', function(req, res, next) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min: 4});
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg)
        });
        res.render('admin/signup', {messages: messages, hasErrors: messages.length > 0});
    } else {
        var newAdmin = new Admin({
            email: req.body.email,
            password: req.body.password
        });

        newAdmin.save(function(err, resut) {
            if (err) {
                console.log(err);
            }
            res.redirect('/');
        });
    }
});

module.exports = router;