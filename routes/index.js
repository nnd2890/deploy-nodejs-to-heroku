var express = require('express');
var router = express.Router();
var csrf = require('csurf');

var Product = require('../models/product');
var Cart = require('../models/cart');
var Order = require('../models/order');

var csrfProtection = csrf();
router.use(csrfProtection);

/* GET home page. */
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
              res.render('shop/index', {
                  products: productChunks,
                  current: page,
                  pages: Math.ceil(count / perPage),
                  title: 'Shopping Cart',
                  successMsg: successMsg,
                  noMessages: !successMsg
              })
          })
      });
});

// paginated product router
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
      .find({})
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec(function(err, docs) {
          Product.count().exec(function(err, count) {
              for (var i = 0; i < docs.length; i += chunkSize) {
                productChunks.push(docs.slice(i, i + chunkSize));
              }
              if (err) return next(err)
              res.render('shop/index', {
                  products: productChunks,
                  current: page,
                  pages: Math.ceil(count / perPage),
                  title: 'Shopping Cart',
                  successMsg: successMsg,
                  noMessages: !successMsg
              })
          })
      });
});

// Handle add product
router.get('/add-product', function(req, res, next) {
  var messages = req.flash('messages');
  res.render('shop/add-product', {title: 'Add Product', csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/add-product', function(req, res, next) {
  req.checkBody('title', 'Invalid title').notEmpty();
  req.checkBody('imagepath', 'Invalid imagepath').notEmpty();
  req.checkBody('price', 'Invalid price').notEmpty();
  req.checkBody('description', 'Invalid description').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
      var messages = [];
      errors.forEach(function(error) {
          messages.push(error.msg);
      });
      res.render('shop/add-product', {messages: messages, hasErrors: messages.length > 0});
  } else {
    var title = req.body.title;
    var imagepath = req.body.imagepath;
    var price = req.body.price;
    var description = req.body.description;
    Product.findOne({'title': title}, function(err, product) {
      if (err) {
        console.log(err);
      }
      if (product) {
        req.flash('messages', 'Product is already existed.');
        res.redirect('/add-product');
      } else {
        var newProduct = new Product();
        newProduct.title = title; 
        newProduct.imagePath = imagepath;
        newProduct.price = price;
        newProduct.description = description;
        newProduct.save(function(err, result) {
          if (err) {
              console.log(err);
          }
          req.flash('success', 'Product saved...');
          res.redirect('/');
        }); 
      }
    });
  }
});

// Handle edit product
router.get('/edit-product/:id', function(req, res, next) {
  var productId = req.params.id;
  Product.findById(productId, function(err, product){
    if (err) {
      console.log(err);
    }
    var messages = req.flash('messages');
    res.render('shop/edit-product', {title: 'Edit Product', csrfToken: req.csrfToken(), product: product, messages: messages, hasErrors: messages.length > 0});
  });
});

router.post('/edit-product/:id', function(req, res, next) {
  var productId = req.params.id;
  req.checkBody('title', 'Invalid title').notEmpty();
  req.checkBody('imagepath', 'Invalid imagepath').notEmpty();
  req.checkBody('price', 'Invalid price').notEmpty();
  req.checkBody('description', 'Invalid description').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
      var messages = [];
      errors.forEach(function(error) {
          messages.push(error.msg);
      });
      req.flash('messages', messages);
      res.redirect('shop/edit-product');
  } else {
    var title = req.body.title;
    var imagepath = req.body.imagepath;
    var price = req.body.price;
    var description = req.body.description;
    Product.findById(productId, function(err, product) {
      if (err) {
        console.log(err);
      } else {
        product.title = title; 
        product.imagePath = imagepath;
        product.price = price;
        product.description = description;
        product.save(function(err, result) {
          if (err) {
              console.log(err);
          }
          req.flash('success', 'Product updated...');
          res.redirect('/');
        }); 
      }
    });
  }
});

router.delete('/article/:id', function(req, res, next) {
    console.log("route delete");
    let query = {_id: req.params.id};
    Product.remove(query, function(err) {
        if(err) {
            console.log(err);
        }
        res.send('Success');
    });
});

// Handle add to cart
router.get('/add-to-cart/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {items: {}});

  Product.findById(productId, function(err, product) {
    if (err) {
      return res.redirect('/');
    }
    
    cart.add(product, productId);
    req.session.cart = cart;
    res.redirect('/');
  });
});

router.get('/reduce/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {items: {}});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {items: {}});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function(req, res, next) {
  if (!req.session.cart) {
    return res.render('shop/shopping-cart', {title: 'Cart', products: null});
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {title: 'Cart', products: cart.generateArray(), totalPrice: cart.totalPrice});
});

router.get('/checkout', isLoggedIn, function(req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('shop/checkout', {title: 'Check Out', csrfToken: req.csrfToken(), total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

router.post('/checkout', isLoggedIn, function(req, res, next) {
  if (!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var order = new Order({
    user: req.user,
    cart: cart,
    address: req.body.address,
    name: req.body.name
  });
  order.save(function(err, result) {
    req.flash('success', 'Successfully bought product!');
    req.session.cart = null;
    res.redirect('/');
  });
});

// Page Category Route
router.get('/product-category/:category/:page', function(req, res, next) {
  
  var category = req.params.category;
  var page = req.params.page || 1;

  // Set Sesion category and page
  req.session.categoryName = category;

  var successMsg = req.flash('success')[0];
  var productChunks = [];
  var chunkSize = 3;
  var perPage = 1*chunkSize;

  Product.find({ 'category': category })
          .skip((perPage * page) - perPage)
          .limit(perPage)
          .exec(function(err, docs) {
              Product.count({ 'category': category }).exec(function(err, count) {
                  for (var i = 0; i < docs.length; i += chunkSize) {
                    productChunks.push(docs.slice(i, i + chunkSize));
                  }
                  if (err) return next(err)
                  res.render('shop/category', {
                      products: productChunks,
                      current: page,
                      pages: Math.ceil(count / perPage),
                      title: 'Shopping Cart',
                      successMsg: successMsg,
                      noMessages: !successMsg,
                      categoryName: req.session.categoryName
                  });
              });
          });
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/users/signin');
}
