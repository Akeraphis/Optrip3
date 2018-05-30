Template.circuit.helpers({
	'trips': function(){
		Meteor.subscribe("allTrips");
		return Trips.find({country: Session.get("selectedCountry")}).fetch()
	}
})