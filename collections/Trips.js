Trips = new Mongo.Collection("trips");

Meteor.methods({
	'insertTrip': function(doc){
		return Trips.insert(doc);
	},
	'deleteTrip': function(doc){
		return Trips.remove(doc);
	},
	//Vider la collection de villes
	'flushAllTrips' : function(){
		Trips.remove({});
	}
});	