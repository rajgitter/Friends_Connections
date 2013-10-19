var User = require('../schema/user');

module.exports.findAllFriends = function(options){
	var client ={
		tree:{
			data:{},
			curr_deepth:1,
			createLevel:function(docs){
				// this refers to tree.
				var tree = this;
				tree.data[tree.curr_deepth] = tree.getCurrentLevelNodes(docs);
			},
			/**
			 * Converts array of mongoose docs to tree nodes
			 * @param  {Array} docs Array of mongoose docs
			 * @return {Array} Returns an array of nodes for a particular level
			 */
			getCurrentLevelNodes:function(docs){
				var levelNodes = [],
					tree = this
					parentLevelNodes = this.data[tree.curr_deepth - 1];

				if(parentLevelNodes){
					parentLevelNodes.forEach(function(parentLevelNode){
						parentLevelNode.friends.forEach(function(friendName){
							docs.forEach(function(doc){
								if(doc.name === friendName){
									var node = {
										name : doc.name,
										level : tree.curr_deepth,
										parent : parentLevelNode.name,
										friends : doc.friends.slice(0, doc.friends.length)
									}
									levelNodes.push(node);
								}
							})
						})					
					})
				}else{
					//form the root node
					var doc = docs[0];
					levelNodes.push({
						name : doc.name,
						level : 1,
						parent : false,
						friends : doc.friends.slice(0, doc.friends.length)
					});
				}
				return levelNodes;
			}
		},
		maxdepth:1,

		request_friends:function(ids){
			if(this.tree.curr_deepth <= this.maxdepth){
				User.find({name: {$in: ids}}, function(err, docs){
					if(err){

						//client.on_friends([]);
						client.onallfriends();
					}else{
						//console.log(client.curr_deepth, docs)
						
						client.on_friends(docs);
					}
				})
			}
		},
		on_friends:function(friends){
			var friends_ids =[];
			if(!Array.isArray(friends)){
				friends = [friends];
			}			
			client.tree.createLevel(friends);
			friends.forEach(function(f){				
				friends_ids = friends_ids.concat(f.friends);
			});
			if(friends_ids.length === 0){
				this.onallfriends();
			}
			this.allfriends = this.allfriends.concat(friends_ids);
			
			if(this.tree.curr_deepth >= this.maxdepth){
				client.onallfriends(client.allfriends);				
			}else{
				this.tree.curr_deepth = this.tree.curr_deepth + 1;
				this.request_friends(friends_ids);
			}
		},
		onallfriends:function(){
			var onallfriends = this.options.onallfriends;			
			if(typeof this.options.onallfriends === "function"){
				onallfriends(this.allfriends);
			}
		},
		init:function(options){
			this.options = options;
			this.maxdepth = options.maxdepth || 1;
			this.request_friends(options.user_id);
		},
		allfriends:[]
	}
	client.init({
		user_id: options.user_id,
		onallfriends:function(allfriends){
			options.cb(allfriends, client.tree);
		},
		maxdepth:options.maxdepth
	});
}