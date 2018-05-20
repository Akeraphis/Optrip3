var countProgress=0;
Session.set("minLFP", {});

Template.relaunch.events({
	'click .optimizeButton': function(e){
		console.log(Session.get("departureFrom"), Session.get("departureDate"), Session.get('selectedCurrency'), Session.get('nbPersons'), Session.get('selectedIp'), Session.get('nbDays'), Session.get("nbChildren"), Session.get("nbInfants"), Session.get("selectedLocal"), Session.get("selectedMarket"));

		Meteor.call("updateIpDays", Session.get('selectedIp'), Session.get('nbDays'), function(error, result){
			if (error){
				console.log(error.reason);
			}
			else{
				Session.set("ipDays", result);
				//send this information to the server to optimize and return result
				Meteor.call('optimizeTrip', Session.get("departureFrom"), Session.get("departureDate"), result, Session.get('selectedCurrency'), Session.get('nbPersons'), Session.get("nbChildren"), Session.get("nbInfants"), Session.get("selectedLocal"), Session.get("selectedMarket"), function(error, res){
					if(error){
						alert("This is an error while updating the fares!");
					}
					else{
						Session.set("results", res[0][1]);
						Session.set("minTotalPrice", res[0][0]);
						Session.set("optimalCircuit", res[0][2]);
						Session.set("newIpDays", res[0][3]);
						console.log(res);
						Session.set("totalResults", res);
						Session.set("liveFlights", res[1]);
						Session.set("selectedLiveFlights", res[1]);
						Session.set("selectedLiveCars", res[0][1][1][4]);
						Session.set("selectedLiveHotels", res[2]);
					}
				});
			}
		});
	},
});

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

Template.minPrice.helpers({
	minTotalPrice : function(){
		if(Session.get("cheapestLiveFlight")){
			if(Session.get("selectedCar")){
				if(Session.get("cheapestHotelCombinations")){
					return Math.round((parseInt(Session.get("selectedCar").cars.estimated_total.amount)+parseInt(Session.get("selectedFlightPrice").total_price)+parseInt(Session.get("cheapestHotelCombinations")))/Session.get('nbPersons'));
				}
				else{
					return Math.round((parseInt(Session.get("selectedCar").cars.estimated_total.amount)+parseInt(Session.get("selectedFlightPrice").total_price))/Session.get('nbPersons'));
				}
			}
			else{
				return Math.round(Session.get("selectedFlightPrice").total_price/Session.get('nbPersons'));
			}
		}
	},

	minCarPrice : function(){
		if(Session.get("selectedCar")){
			return Math.round(Session.get("selectedCar").cars.estimated_total.amount);
		}
	},

	minFlightPrice : function(){
		return Session.get("selectedFlightPrice").total_price;
	},

	minHotelPrices : function(){
		var res = Session.get("selectedLiveHotels");
		var hp = 0;

		_.forEach(res, function(r){
			if (r.hotelFare.results.length>0){
				hp = hp + parseFloat(r.hotelFare.results[0].total_price.amount);
			}
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

	nbPersons : function(){
		return Session.get('nbPersons');
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
