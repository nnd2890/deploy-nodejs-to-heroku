var express = require('express');
var router = express.Router();
var csrf = require('csurf');

var Admin = require('../models/admin');
var Product = require('../models/product');

var csrfProtection = csrf();
router.use(csrfProtection);


router.get('/signup', function(req, res, next) {
    var messages = req.flash('messages');
    res.render('admin/signup', {csrfToken: req.csrfToken(),  messages: messages, hasErrors: messages.length > 0});
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
        var email = req.body.email;
        var password = req.body.password;
        Admin.findOne({'email': email}, function(err, admin) {
            if (err) {
               console.log(err);
            }
            if (admin) {
                req.flash('messages', 'Email is already in use.');
                res.redirect('/admins/signup')
            } else {
                var newAdmin = new Admin();
                newAdmin.email = email; 
                newAdmin.password = newAdmin.encryptPassword(password);
                newAdmin.save(function(err, result) {
                    if (err) {
                        console.log(err);
                    }
                    req.flash('success', 'Admin saved...');
                    res.redirect('/');
                }); 
            }
        });
    }
});

router.get('/products/:page', function(req, res, next) {
    var perPage = 3;
    var page = req.params.page || 1;

    Product
        .find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec(function(err, products) {
            Product.count().exec(function(err, count) {
                if (err) return next(err);
                 // set number of item will appearencing in one row
                var productChunks = [];
                var chunkSize = 3;
                for (var i = 0; i < products.length; i += chunkSize) {
                    productChunks.push(products.slice(i, i + chunkSize));
                }

                res.render('admin/product', {
                    products: productChunks,
                    curent: page,
                    pages: Math.ceil(count / perPage)
                });
            });
        });
    // var successMsg = req.flash('success')[0];
    // Product.find(function(err, docs) {
    //     var productChunks = [];
    //     var chunkSize = 3;
    //     for (var i = 0; i < docs.length; i += chunkSize) {
    //         productChunks.push(docs.slice(i, i + chunkSize));
    //     }
    //     res.render('admin/product', {products: productChunks, successMsg: successMsg, noMessages: !successMsg});
    // });
});

module.exports = router;