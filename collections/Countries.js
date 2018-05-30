Countries = new Mongo.Collection("countries");

Meteor.methods({
	'insertCountry': function(doc){
		return Countries.insert(doc);
	},
	'deleteCountry': function(doc){
		return Countries.remove(doc);
	},
	//Vider la collection de villes
	'flushAllCountries' : function(){
		Countries.remove({});
	},
	'insertUniqueCountry': function(doc){
		return Countries.update({name : doc.country}, {name : doc.country}, {upsert : true});
	}
});	