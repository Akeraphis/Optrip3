Currencies = new Mongo.Collection("currencies");

Meteor.methods({
	'insertCurrency': function(doc){
		return Currencies.insert(doc);
	},
	//Vider la collection de villes
	'flushAllCurrencies' : function(){
		Currencies.remove({});
	}
});	