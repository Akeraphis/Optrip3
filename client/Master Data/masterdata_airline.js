Template.mdairlines.helpers({
	'allHotelDetails': function(){
		Meteor.subscribe("allHotelDetails")
		return Airlines.find({}).fetch();
	}
});

//Events Airlines
Template.mdairlines.events({
	//Call the import of airlines list
	'click .generateAirlines': function(){
		Meteor.call("importAirlines", function(err,id){if(err){alert(err.reason);}});
	},

	//flush all airports
	'click .flushAirlines': function(){
		Meteor.call("flushAllAirlines", function(err,id){if(err){alert(err.reason);}});
	},

	'click .reactive-table tbody tr': function (event) {
    event.preventDefault();
    var airline = this;
    // checks if the actual clicked element has the class `delete`
    console.log(airline, event.target);
  }
});