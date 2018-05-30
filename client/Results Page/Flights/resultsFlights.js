Template.minFlight.events({
	'click #myTabs a': function(e){
		e.preventDefault()
  		$(this).tab('show')
	},

	'click .btn-info': function(e){
		filterFlights();
		FlowRouter.go('/optimization/results/flights');
	}
});


Template.minFlight.helpers({
	minLiveFlight : function(){
		return Session.get("selectedFlightPrice");
	},
	getFirstItinerary : function(){
		return Session.get("selectedItin");
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		//return cur2.Symbol;
		return "€";
	}
});

Template.leg.helpers({
	getDepDate: function(){	
		var depDateTime = this.departs_at;
		return depDateTime.substring(0, depDateTime.indexOf("T"));
	},
	getDepTime: function(){
		var depDateTime = this.departs_at;
		return depDateTime.substring(depDateTime.indexOf("T")+1);
	},
	getArrDate: function(){
		var depDateTime = this.arrives_at;
		return depDateTime.substring(0, depDateTime.indexOf("T"));
	},
	getArrTime: function(){
		var depDateTime = this.arrives_at;
		return depDateTime.substring(depDateTime.indexOf("T")+1);
	},
	getLeg : function(leg){
		return leg
	},
	getImage : function(operating_airline){
		var handle = Meteor.subscribe("airlineByCode", operating_airline);
		if(handle.ready()){
			return Airlines.findOne({iata: operating_airline}).logo;
		}
	},
	getAirlineName : function(operating_airline){
		var handle = Meteor.subscribe("airlineByCode", operating_airline);
		if(handle.ready()){
			return Airlines.findOne({iata: operating_airline}).name;
		}
	},
	getAirport: function(code2){
		var handle = Meteor.subscribe("airportByCode", code2);
		if(handle.ready()){
			return Airports.findOne({iata: code2}).name;
		}
	},
});
