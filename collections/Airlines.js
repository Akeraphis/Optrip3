Airlines = new Mongo.Collection("airlines");

Meteor.methods({
	'insertAirline': function(doc){
		return Airlines.insert(doc);
	},
	'deleteAirline': function(doc){
		return Airlines.remove(doc);
	},
	//Vider la collection d'aéroports
	'flushAllAirlines' : function(){
		Airlines.remove({});
	}
})