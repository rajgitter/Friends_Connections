var mongoose = require('mongoose');

var User = new mongoose.Schema({
	name:{type:String},
	friends:{type:Array, default:[]},
	allfriends:{type:Array, default:[]}
}, {
	collection: 'login'
});
var User = mongoose.model('User', User);
module.exports = User;