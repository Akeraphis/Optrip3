Locales = new Mongo.Collection("locales");

Meteor.methods({
	'insertLocal': function(doc){
		return Locales.insert(doc);
	},
	//Vider la collection de villes
	'flushAllLocales' : function(){
		Locales.remove({});
	}
});	