var express = require('express');
var router = express.Router();
var csrf = require('csurf');

var Product = require('../models/product');
var Order = require('../models/order');
var Cart = require('../models/cart');

var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/products', isAdmin, function(req, res, next) {
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
      .find({"status": 1})
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec(function(err, docs) {
          Product.count({"status": 1}).exec(function(err, count) {
              for (var i = 0; i < docs.length; i += chunkSize) {
                productChunks.push(docs.slice(i, i + chunkSize));
              }
              if (err) return next(err)
              req.session.products = productChunks;
              res.render('admin/product', {
                  current: page,
                  pages: Math.ceil(count / perPage),
                  title: 'Shopping Cart',
                  csrfToken: req.csrfToken(),
                  successMsg: successMsg,
                  noMessages: !successMsg
              })
          })
      });
});

router.get('/products/:page', function(req, res, next) {
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
      .find({"status": 1})
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec(function(err, docs) {
          Product.count({"status": 1}).exec(function(err, count) {
              for (var i = 0; i < docs.length; i += chunkSize) {
                productChunks.push(docs.slice(i, i + chunkSize));
              }
              if (err) return next(err)
              res.render('admin/product', {
                  products: productChunks,
                  current: page,
                  pages: Math.ceil(count / perPage),
                  title: 'Shopping Cart',
                  csrfToken: req.csrfToken(),
                  successMsg: successMsg,
                  noMessages: !successMsg
              })
          })
      });
});

router.get('/orders', function(req, res, next) {
  Order.find({}, function(err, orders) {
    if (err) {
      return res.write('Error');
    }
    var cart;
    orders.forEach(function(order) {
      cart = new Cart(order.cart);
      order.items = cart.generateArray();
    });
    res.render('admin/orders', {title: 'Orders', orders: orders, csrfToken: req.csrfToken()});
  });
});

// Change Status for order
router.post('/order-status/:id', function(req, res, next) {
    let query = {_id: req.params.id};
    Order.findOne(query, function(err, doc) {
        if(err) {
            console.log(err);
        }
        doc.status = req.body.status;
        doc.save();
    });
});


function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.isAdmin === true) {
    return next();
  }
  req.flash('error', 'Please sign in with admin account');
  res.redirect('/users/signin');
}

module.exports = router;