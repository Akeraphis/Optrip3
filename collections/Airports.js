Airports = new Mongo.Collection("airports");

Meteor.methods({
	'insertAirport': function(doc){
		return Airports.insert(doc);
	},
	'deleteAirport': function(doc){
		return Airports.remove(doc);
	},
	//Vider la collection d'aéroports
	'flushAllAirports' : function(){
		Airports.remove({});
	}
})