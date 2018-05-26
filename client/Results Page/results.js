var countProgress=0;

Template.results.helpers({
	results : function(){
		if (Session.get("cheapestLiveFlight")){
			return true;
		}
		else{
			return false;
		}
	},
	hasCar : function(){
		if(Session.get("cheapestLiveCar")){
			return true
		}
		else{
			return false
		}
	}
});

Template.minTotalPriceT.helpers({
	minTotalPrice : function(){
		var carPrice = 0;
		var hotelPrice = 0;
		var flightPrice = 0;

		if(Session.get("cheapestLiveFlight")){flightPrice=parseFloat(Session.get("selectedFlightPrice").total_price)}
		if(Session.get("selectedCar")){carPrice=parseFloat(Session.get("selectedCar").cars.estimated_total.amount)}
		if(Session.get("cheapestHotelCombinations")){hotelPrice=parseFloat(Session.get("cheapestHotelCombinations"))}

		return Math.round((hotelPrice+carPrice+flightPrice)/Session.get("nbPersons"));
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		//return cur2.Symbol;
		return "€";
	},
})


Template.minPrice.helpers({

	minCarPrice : function(){
		if(Session.get("selectedCar")){
			return Math.round(Session.get("selectedCar").cars.estimated_total.amount);
		}
		else return 0;
	},
	minHotelPrices : function(){
		var res = Session.get("cheapestLiveHotels");
		var hp = 0;

		_.forEach(res, function(r){
			hp = hp + parseFloat(r.hotelFare.results.total_price.amount);
		});

		Session.set("cheapestHotelCombinations", hp);

		if(hp >0){
			return Math.round(hp);
		}
	},

	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		//return cur2.Symbol;
		return "€";
	},
	hasCar : function(){
		if(Session.get("cheapestLiveCar")){
			return true
		}
		else{
			return false
		}
	}
});

Template.minTotalFlight.helpers({
	minFlightPrice : function(){
		return Session.get("selectedFlightPrice").total_price;
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		//return cur2.Symbol;
		return "€";
	},
})

Template.numberPersons.helpers({
	nbPersons : function(){
		return Session.get('nbPersons');
	},
	nbNights: function(){
		var ips =Session.get("newIpDays");
		var res = 0;
		_.forEach(ips, function(ip){
			res= res+ ip.nbDays;
		});
		return res;
	}
})


Template.tripDays.onRendered(function(){

	//Display trip stops
	var newIpDays = Session.get("newIpDays");
	var depDate = Session.get('departureDate');
	var countDays=0;

	_.forEach(Session.get("newIpDays"), function(ipDays){
		var startDate = moment(depDate+' 15:00').add(countDays, 'days');
		var endDate = moment(depDate+' 10:00').add(ipDays.nbDays + countDays,'days');
		var event ={title : ipDays.ip.city, start : startDate, end : endDate, color:'red', editable :'true'};
		$('#myCalendar').fullCalendar( 'renderEvent', event, true);
		countDays= countDays+ipDays.nbDays;
	});

	if(Session.get("selectedLiveHotels")){
		var nbOutboundFlights = Session.get("cheapestLiveFlight").itineraries[0].outbound.flights.length;
		var nbInboundFlights = Session.get("cheapestLiveFlight").itineraries[0].inbound.flights.length;
		var event2 = {title : "trip", start : moment(Session.get("cheapestLiveFlight").itineraries[0].outbound.flights[0].departs_at), end: moment(Session.get("cheapestLiveFlight").itineraries[0].inbound.flights[nbInboundFlights-1].arrives_at), editable : 'true' };

		$('#myCalendar').fullCalendar( 'renderEvent', event2, true);
		$('#myCalendar').fullCalendar( 'gotoDate', moment(depDate) );

		//Display Flights
		var outboundFlight = {title : 'Outbound Flight', start : moment(Session.get("cheapestLiveFlight").itineraries[0].outbound.flights[0].departs_at), end : moment(Session.get("cheapestLiveFlight").itineraries[0].outbound.flights[nbOutboundFlights-1].arrives_at), color:'green'};
		var inboundFlight= {title : 'Inbound Flight', start : moment(Session.get("cheapestLiveFlight").itineraries[0].inbound.flights[0].departs_at), end : moment(Session.get("cheapestLiveFlight").itineraries[0].inbound.flights[nbInboundFlights-1].arrives_at), color:'green'};
		$('#myCalendar').fullCalendar( 'renderEvent', outboundFlight, true);
		$('#myCalendar').fullCalendar( 'renderEvent', inboundFlight, true);
	}

});

