var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var schema = Schema({
	email: {type: String, required: true},
	password: {type: String, required: true}
});

schema.methods.encryptPassword = function(passwrod){
	return bcrypt.hashSync(passwrod, bcrypt.genSaltSync(5), null);
};

schema.methods.vaidPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Admin', schema);