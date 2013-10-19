var mongoose = require('mongoose');

var AllFriends = new mongoose.Schema({
	name:{type:String},
	allfriends:{type:Array, default:[]}
}, {
	collection: 'allfriends'
})


var AllFriends = mongoose.model('AllFriends', AllFriends);
module.exports = AllFriends;