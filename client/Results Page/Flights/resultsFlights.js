Meteor.subscribe("allAirports");
Meteor.subscribe("allAirlines");

Template.minFlight.events({
	'click #myTabs a': function(e){
		e.preventDefault()
  		$(this).tab('show')
	},

	'click .btn-info': function(e){
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
		var air = Airlines.findOne({iata : operating_airline});
		if(air){
			return air.logo;
		}
	},
	getAirport: function(code){
		var airport = Airports.findOne({code : code});
		if(airport){
			return airport.name;
		}
	}
});
