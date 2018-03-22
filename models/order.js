var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    cart: {type: Object, required: true},
    createDate: {type: Date, default: Date.now},
    updateDate: {type: Date},
    address: {type: String, required: true},
    name: {type: String, required: true},
    status: {type: Number, required: true, default: 1}
});

module.exports = mongoose.model('Oder', schema);