LiveFlightPrices = new Mongo.Collection("liveFlightPrices");

Meteor.methods({
	'insertLiveFlightPrices': function(doc){
    	return Hotels.insert(doc);
	},

	'flushAllLiveFlightPrices': function(){
    	Hotels.remove({});
  }
});