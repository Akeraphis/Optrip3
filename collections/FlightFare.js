FlightFares = new Mongo.Collection("flightFares");

Meteor.methods({
	'insertFlightFares': function(doc){
    return FlightFares.insert(doc);
	},

  'flushAllFares': function(){
    FlightFares.remove({});
  }
});

