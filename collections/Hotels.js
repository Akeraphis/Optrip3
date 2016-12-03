Hotels = new Mongo.Collection("hotels");

Meteor.methods({
	'insertHotels': function(doc){
    	return Hotels.insert(doc);
	},

	'flushAllHotels': function(){
    	Hotels.remove({});
  }
});