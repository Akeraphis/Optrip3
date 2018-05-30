Template.masterdata_trips.helpers({
	'allTrips': function(){
		var handle = Meteor.subscribe("allTrips");
		if(handle.ready()){
			return Trips.find({}).fetch();
		}
	}
});

Template.masterdata_trips.events({
	'click .newTrip': function(){
		FlowRouter.go("/masterdata/tripCreation");
	}
});