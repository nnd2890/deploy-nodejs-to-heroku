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
  var perPage = 3*chunkSize;
  var page = 1;

  if (req.params.page > 1) {
    var page = req.query.page;
  }

  if (req.query.search) {
    var regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Product
      .find({"title": regex})
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec(function(err, docs) {
          Product.count({"title": regex}).exec(function(err, count) {
              for (var i = 0; i < docs.length; i += chunkSize) {
                productChunks.push(docs.slice(i, i + chunkSize));
              }
              if (err) return next(err)
              req.session.productSearch = productChunks;
              res.render('shop/index', {
                  // products: productChunks,
                  current: page,
                  pages: Math.ceil(count / perPage),
                  search: req.query.search,
                  title: 'Shopping Cart',
                  successMsg: successMsg,
                  noMessages: !successMsg
              })
          })
      });
  } else {
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
              res.render('shop/index', {
                  current: page,
                  pages: Math.ceil(count / perPage),
                  title: 'Shopping Cart',
                  successMsg: successMsg,
                  noMessages: !successMsg
              })
          })
      });
  }
});

// paginated product router
router.get('/products/:page', function(req, res, next) {
  var successMsg = req.flash('success')[0];
  // Set home page will appear
  var productChunks = [];
  var chunkSize = 3;
  var perPage = 3*chunkSize;
  var page = 1;

  if (req.params.page > 1) {
    var page = req.params.page;
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
              res.render('shop/index', {
                  products: productChunks,
                  current: page,
                  pages: Math.ceil(count / perPage),
                  title: 'Shopping Cart',
                  successMsg: successMsg,
                  search: req.query.search,
                  noMessages: !successMsg
              })
          })
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
  var perPage = 3*chunkSize;

  Product.find({ 'category': category , "status": 1})
          .skip((perPage * page) - perPage)
          .limit(perPage)
          .exec(function(err, docs) {
              Product.count({ 'category': category, "status": 1 }).exec(function(err, count) {
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

// Handle add product
router.get('/add-product', isAdmin, function(req, res, next) {
  var messages = req.flash('messages');
  res.render('shop/add-product', {title: 'Add Product', csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/add-product', isAdmin, function(req, res, next) {
  console.log(req.body);
  req.checkBody('title', 'Invalid title').notEmpty();
  req.checkBody('imagepath', 'Invalid imagepath').notEmpty();
  req.checkBody('category', 'Invalid category').notEmpty();
  req.checkBody('price', 'Invalid price').notEmpty();
  req.checkBody('description', 'Invalid description').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
      var messages = [];
      errors.forEach(function(error) {
          messages.push(error.msg);
      });
      req.flash('messages', messages);
      res.redirect('/add-product');
  } else {
    var title = req.body.title;
    var imagepath = req.body.imagepath;
    var category = req.body.category;
    var price = req.body.price;
    var discount = req.body.discount;
    var slideShow = req.body.slideShow;
    if (slideShow = 'true') {
      slideShow = true;
    }
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
        newProduct.category = category;
        newProduct.price = price;
        newProduct.discount = discount;
        newProduct.slideShow = slideShow;
        newProduct.description = description;
        newProduct.save(function(err, result) {
          if (err) {
              console.log(err);
          }
          req.flash('success', 'Product saved...');
          res.redirect('/admins/products');
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
          res.redirect('/admins/products');
        }); 
      }
    });
  }
});

router.delete('/delete-product/:id', function(req, res, next) {
    console.log("route delete");
    let query = {_id: req.params.id};
    Product.findOne(query, function(err, doc) {
        if(err) {
            console.log(err);
        }
        doc.status = 0;
        doc.save();
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

router.get('/plus/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {items: {}});

  cart.plusByOne(productId);
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
  res.render('shop/shopping-cart', {title: 'Cart', productsCart: cart.generateArray(), totalPrice: cart.totalPrice});
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

module.exports = router;

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/users/signin');
}

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.isAdmin === true) {
    return next();
  }
  req.flash('error', 'Please sign in with admin account');
  res.redirect('/users/signin');
}
