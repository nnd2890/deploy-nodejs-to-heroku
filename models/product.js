var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
	imagePath: {type: String, required: true},
	title: {type: String, required: true},
	category: {type: String, required: true},
	description: {type: String, required: true},
	price: {type: Number, required: true},
	discount: {type: Number},
	slideShow: {type: Boolean, default: false},
	status: {type: Number, default: 1, required: true}
});

 module.exports = mongoose.model('Product', schema);