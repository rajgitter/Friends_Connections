
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , mongodb = require('mongodb')
  , mongoose = require('mongoose')
  , helpers = require('./util/helpers');


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://127.0.0.1:27017/f');



mongoose.connection.on('open', function(err, doc){
	console.log("connection established");
})


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.get('/', routes.index);
app.get('/users', user.list);
app.get('/:user_id/allfriends/:deep?', function(req, res){
	var params = req.params,
		deep = params.deep,
		user_ids = [params.user_id];
	if(typeof deep === 'undefined'){
		deep = 1;
	}
	helpers.findAllFriends({
		cb:function(allfriends, tree){
			//res.send(tree)
			res.send(allfriends)
		},
		maxdepth:deep,
		user_id: user_ids
	})
	
});

app.get('/:friend_id/linkpaths', function(req, res){
	var user_ids = ['sur'],
		friend_id = req.params.friend_id,
		linker = {
			tree:null,
			paths : [],
			path:function(node){
				var path = [],
					nodelLevel;
				while(node.parent){
					nodelLevel = parseInt(node.level,10);
					path.push(node);
					linker.tree[nodelLevel-1].forEach(function(parentNode){
						if(node.parent === parentNode.name){
							node = parentNode;
							return;
						}
					})
				}
				this.paths.push(path);
			},
			getAllPaths:function(){
				return this.paths;
			}
		}


	helpers.findAllFriends({
		cb:function(allfriends, tree){
			console.log("allfriends", tree)
			linker.tree = tree.data;

			for(var level in tree.data){

				var levelNodes = tree.data[level];
				levelNodes.forEach(function(node){
					if(node.name === friend_id){
						linker.path(node)
					}
				})
			}
			res.send(linker.getAllPaths());
		},
		maxdepth:4,
		user_id: user_ids
	})
})

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
