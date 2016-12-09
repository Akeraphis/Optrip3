Markets = new Mongo.Collection("markets");

Meteor.methods({
	'insertMarket': function(doc){
		return Markets.insert(doc);
	},
	//Vider la collection de villes
	'flushAllMarkets' : function(){
		Markets.remove({});
	}
});	