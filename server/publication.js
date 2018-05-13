Meteor.publish("allAirports", function(){
	return Airports.find({},{
		fields: {content: 0}
	});
});

Meteor.publish("allInterestPoints", function(){
	return InterestPoints.find({},{
		fields: {content: 0}
	});
});

Meteor.publish('places', function(box) {
    return InterestPoints.find({lat : {$gt : box[0][0], $lt : box[1][0]}, lng: {$gt: box[0][1], $lt: box[1][1]}});
});


Meteor.publish("allFlightFares", function(){
	return FlightFares.find({},{
		fields: {content :0}
	});
});

Meteor.publish("allCarFares", function(){
	return CarFares.find({},{
		fields: {content :0}
	});
});

Meteor.publish("allHotelFares", function(){
	return HotelFares.find({},{
		fields: {content :0}
	});
});

Meteor.publish("allSuggestions", function(){
	return AutoSuggest.find({},{
		fields: {content :0}
	});
});

Meteor.publish("allCurrencies", function(){
	return Currencies.find({},{
		fields: {content :0}
	});
});

Meteor.publish("allHotels", function(){
	return Hotels.find({},{
		fields: {content :0}
	});
});

Meteor.publish("allLiveFlightPrices", function(){
	return LiveFlightPrices.find({},{
		fields: {content :0}
	});
});

Meteor.publish("allLocales", function(){
	return Locales.find({},{
		fields: {content :0}
	});
});

Meteor.publish("allMarkets", function(){
	return Markets.find({},{
		fields: {content :0}
	});
});

Meteor.publish("allProgressionUsers", function(){
	return ProgressionUsers.find({}, {
		fields:{content :0}
	});
});

Meteor.publish("allAirlines", function(){
	return Airlines.find({});
});