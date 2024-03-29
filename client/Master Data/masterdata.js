//---------------------------------------------------------
//HELPERS MASTERDATA
//---------------------------------------------------------
Template.mdff.helpers({
	"getAllFlightFares": function(){
		Meteor.subscribe("allFlightFares");
		Meteor.subscribe("allCarFares");
		Meteor.subscribe("allHotelFares");
		return FlightFares.find({});
	}
})


//---------------------------------------------------------
//EVENTS MASTERDATA
//---------------------------------------------------------


Template.mdff.events({

	'click .refreshFlightFare': function(){
		Meteor.call('flushAllFares', function(err,id){if(err){alert(err.reason);}});
		Meteor.call('importAllFares', function(err,id){if(err){alert(err.reason);}});
	},

	'click .flushAllFares': function(){
		Meteor.call('flushAllFares', function(err,id){if(err){alert(err.reason);}});
		Meteor.call('flushAllCarFares', function(err,id){if(err){alert(err.reason);}});
		Meteor.call('flushAllHotelFares', function(err,id){if(err){alert(err.reason);}});
		Meteor.call('flushAllHotels', function(err,id){if(err){alert(err.reason);}});
	}

});


Template.mdothers.events({
	'click .getAllCurrencies': function(){
		var res = Meteor.call('retrieveCurrencies');
		console.log(res);
	},

	'click .flushAllCurrencies': function(){
		Meteor.call('flushAllCurrencies', function(err,id){if(err){alert(err.reason);}})
	},

	'click .getAllLocales': function(){
		var res = Meteor.call('retrieveLocales');
		console.log(res);
	},

	'click .flushAllLocales': function(){
		Meteor.call('flushAllLocales', function(err,id){if(err){alert(err.reason);}})
	},
	'click .getAllMarkets': function(){
		var res = Meteor.call('retrieveMarkets');
		console.log(res);
	},

	'click .flushAllMarkets': function(){
		Meteor.call('flushAllMarkets', function(err,id){if(err){alert(err.reason);}})
	}
});
