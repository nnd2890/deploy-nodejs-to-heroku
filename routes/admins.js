var express = require('express');
var router = express.Router();
var csrf = require('csurf');

var Admin = require('../models/admin');
var Product = require('../models/product');

var csrfProtection = csrf();
router.use(csrfProtection);

// Admin home page
router.get('/', function(req, res, next) {
    var successMsg = req.flash('success')[0];
    // Set home page will appear
    var productChunks = [];
    var chunkSize = 3;
    var perPage = 1*chunkSize;
    var page = 1;

    if (req.params.page > 1) {
        var page = req.params.page
    }

    Product
      .find({})
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec(function(err, docs) {
          Product.count().exec(function(err, count) {
              for (var i = 0; i < docs.length; i += chunkSize) {
                productChunks.push(docs.slice(i, i + chunkSize));
              }
              if (err) return next(err)
              res.render('admin/product', {
                  products: productChunks,
                  current: page,
                  pages: Math.ceil(count / perPage),
                  title: 'Shopping Cart',
                  successMsg: successMsg,
                  noMessages: !successMsg,
                  csrfToken: req.csrfToken()
              })
          })
      });
});

router.get('/:page', function(req, res, next) {
    var successMsg = req.flash('success')[0];
    // Set home page will appear
    var productChunks = [];
    var chunkSize = 3;
    var perPage = 1*chunkSize;
    var page = 1;

    if (req.params.page > 1) {
        var page = req.params.page
    }

    Product
      .find({})
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec(function(err, docs) {
          Product.count().exec(function(err, count) {
              for (var i = 0; i < docs.length; i += chunkSize) {
                productChunks.push(docs.slice(i, i + chunkSize));
              }
              if (err) return next(err)
              res.render('admin/product', {
                  products: productChunks,
                  current: page,
                  pages: Math.ceil(count / perPage),
                  title: 'Shopping Cart',
                  successMsg: successMsg,
                  noMessages: !successMsg,
                  csrfToken: req.csrfToken(),
              })
          })
      });
});

router.get('/signup', function(req, res, next) {
    var messages = req.flash('messages');
    res.render('admin/signup', {title: 'Shopping Cart', csrfToken: req.csrfToken(),  messages: messages, hasErrors: messages.length > 0});
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

        req.flash('messages', messages);
        res.redirect('/admins/signup');
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



module.exports = router;