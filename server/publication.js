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