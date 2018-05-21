
Session.set("count",0);
var toBeDisplayed = 15;

Template.displayAllFlight.events({
	'click .btn-success': function(e){
		var depPlace = this.outbound.flights[0].origin.airport;
		var arrPlace = this.inbound.flights[this.inbound.flights.length - 1].destination.airport;
		var depTime = this.outbound.flights[0].departs_at;
		var arrTime = this.inbound.flights[this.inbound.flights.length - 1].arrives_at;

		var It = Session.get("selectedLiveFlights")
		var res = {};

		_.forEach(It, function(prop){
			_.forEach(prop.itineraries, function(itin){
				if(itin.outbound.flights[0].origin.airport == depPlace && itin.inbound.flights[itin.inbound.flights.length - 1].destination.airport == arrPlace && depTime == itin.outbound.flights[0].departs_at && arrTime == itin.inbound.flights[itin.inbound.flights.length - 1].arrives_at){
					res = prop;
					res2 = itin;
				}
			});
		});

		Session.set("selectedItin", res2);
		Session.set("selectedFlightPrice", res.fare);
		FlowRouter.go('/optimization/results');
	},
	'click .btn-default': function(e){
		FlowRouter.go('/optimization/results');
	}
});

Template.displayAllFlight.helpers({
	allItineraries : function(){
		return Session.get("selectedLiveFlights").slice(0, toBeDisplayed);
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		//return cur2.Symbol;
		return "€";
	},
	getOutboundId : function(){
		return "outbound"+Session.get("count");
	},
	getInboundId : function(){
		return "inbound"+Session.get("count");
	},
	increment : function(){
		Session.set("count", Session.get("count")+1);
	},
	getInc : function(increment){
		return Session.get("count");
	},
});

Template.displayLeg.helpers({
	getDepDate: function(depDateTime){
		if(depDateTime){
			return depDateTime.substring(0, depDateTime.indexOf("T"));
		}
	},
	getDepTime: function(depDateTime){
		if(depDateTime){
			return depDateTime.substring(depDateTime.indexOf("T")+1);
		}
	},
	getLeg : function(leg){
		return leg
	}
});


