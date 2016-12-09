Router.configure({
	layoutTemplate: 'mainLayout'
});

Router.route('/',{
	name: 'home',
	data: function(){
		var interestPoints = InterestPoints.find();

		return {
			interestPoints: interestPoints,

		};
	},
	waitOn: function(){
		return [Meteor.subscribe("allInterestPoints"), Meteor.subscribe("allSuggestions"), Meteor.subscribe("allCurrencies"), Meteor.subscribe("allLocales"), Meteor.subscribe("allMarkets")];
	}
});

Router.route('/masterdata/airports',{
	name:'mdairports',
	data: function(){
		var airports = Airports.find();

		return {
			airports: airports
		};
	},
	waitOn: function(){
		return Meteor.subscribe("allAirports");
	}	
})

Router.route('/masterdata/interestPoints',{
	name:'mdip',
	data: function(){
		var interestPoints = InterestPoints.find();

		return {
			interestPoints: interestPoints
		};
	},
	waitOn: function(){
		return Meteor.subscribe("allInterestPoints");
	}	
});

Router.route('/masterdata/fares',{
	name:'mdff',
	data: function(){
		/*var flightFares = FlightFares.find();

		return {
			flightFares: flightFares
		};*/
	},
	waitOn: function(){
		return [Meteor.subscribe("allFlightFares"), Meteor.subscribe("allCarFares"), Meteor.subscribe("allHotelFares"), Meteor.subscribe("allHotels"), Meteor.subscribe("allLiveFlightPrices")];
	}	
});

Router.route('/masterdata/others',{
	name:'mdothers',
	data: function(){
		var currencies = Currencies.find();

		return {
			currencies: currencies
		};
	},
	waitOn: function(){
		return [Meteor.subscribe("allCurrencies"), Meteor.subscribe("allLocales"), Meteor.subscribe("allMarkets")];
	}	
});

Router.route('/optimization/results',{
	name:'results',
	data: function(){
		var currencies = Currencies.find();

		return {
			currencies: currencies
		};
	},
	waitOn: function(){
		return [Meteor.subscribe("allCurrencies"), Meteor.subscribe("allLocales"), Meteor.subscribe("allMarkets")];
	}	
});