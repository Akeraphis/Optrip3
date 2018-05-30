Template.mdhd.helpers({
	'allHotelDetails': function(){
		Meteor.subscribe("allHotelDetails")
		return HotelDetails.find({}).fetch();
	}
});

//Events Airlines
Template.mdhd.events({
	//Call the import of airlines list
	'click .generateHotelsDetails': function(){
		Meteor.call("importHotelDetails", function(err,id){if(err){alert(err.reason);}});
	},

	//flush all airports
	'click .flushHotelDetails': function(){
		Meteor.call("flushAllHotelDetails", function(err,id){if(err){alert(err.reason);}});
	}
});