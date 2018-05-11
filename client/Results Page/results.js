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

Template.minFlight.events({
	'click #myTabs a': function(e){
		e.preventDefault()
  		$(this).tab('show')
	}
})

Template.results.helpers({
	results : function(){
		if (Session.get("cheapestLiveFlight")){
			return true;
		}
		else{
			return false;
		}
	},
	gotLiveFlight : function(){
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
			if(Session.get("cheapestLiveCar")){
				if(Session.get("cheapestHotelCombinations")){
					return Math.round(parseInt(Session.get("cheapestLiveCar").cars.estimated_total.amount)+parseInt(Session.get("cheapestLiveFlight").fare.total_price)+Session.get("cheapestHotelCombinations"));
				}
				else{
					return Math.round(parseInt(Session.get("cheapestLiveCar").cars.estimated_total.amount)+parseInt(Session.get("cheapestLiveFlight").fare.total_price));
				}
			}
			else{
				return Math.round(Session.get("cheapestLiveFlight").fare.total_price);
			}
		}
	},

	minCarPrice : function(){
		if(Session.get("cheapestLiveCar")){
			return Math.round(Session.get("cheapestLiveCar").cars.estimated_total.amount);
		}
	},

	minFlightPrice : function(){
		return Session.get("cheapestLiveFlight").fare.total_price;
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

Template.minFlight.helpers({
	minLiveFlight : function(){
		var res = Session.get("cheapestLiveFlight");
		return res;
	},
	getFirstItinerary : function(){
		var res = Session.get("cheapestLiveFlight");
		return res.itineraries[0];
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
	}
});

Template.minCar.helpers({

	minVehicle : function(){
		return Session.get("cheapestLiveCar");
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		//return cur2.Symbol;
		return "€";
	}
});

Template.minHotel.helpers({
	minHotels : function(){
		var res = Session.get("selectedLiveHotels");
		return getMinHotels(res);
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		//return cur2.Symbol;
		return "€";
	},
	getFirstImage : function(hotelId){
		var res ={};
		var slh = Session.get("selectedLiveHotels");

		_.forEach(slh, function(lh){
			_.forEach(lh.data.hotels, function(hot){
				if(hot.hotel_id==hotelId){
					res = hot.newImages[0].url;
				}
			})
		});
		return res;
	},
	getStars : function(hotelId){
		var res ="";
		var slh = Session.get("selectedLiveHotels");

		_.forEach(slh, function(lh){
			_.forEach(lh.data.hotels, function(hot){
				if(hot.hotel_id==hotelId){
					if(hot.star_rating==1){
						res=[{}];
					}
					else if(hot.star_rating==2){
						res=[{},{}];
					}
					else if(hot.star_rating==3){
						res=[{},{},{}];
					}
					else if(hot.star_rating==4){
						res=[{},{},{},{}];
					}
					else if(hot.star_rating==5){
						res=[{},{},{},{},{}];
					}
				}
			})
		});
		return res;
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

	if(Session.get("minLFP")){
		var event2 = {title : "trip", start : moment(Session.get("minLFP").OutboundLeg.Departure), end: moment(Session.get("minLFP").InboundLeg.Arrival), editable : 'true' };

		$('#myCalendar').fullCalendar( 'renderEvent', event2, true);
		$('#myCalendar').fullCalendar( 'gotoDate', moment(depDate) );

		//Display Flights
		var outboundFlight = {title : 'Outbound Flight', start : moment(Session.get("minLFP").OutboundLeg.Departure), end : moment(Session.get("minLFP").OutboundLeg.Arrival), color:'green'};
		var inboundFlight= {title : 'Inbound Flight', start : moment(Session.get("minLFP").InboundLeg.Departure), end : moment(Session.get("minLFP").InboundLeg.Arrival), color:'green'};
		$('#myCalendar').fullCalendar( 'renderEvent', outboundFlight, true);
		$('#myCalendar').fullCalendar( 'renderEvent', inboundFlight, true);
	}
});

Template.tripDays.events({
	'click #myCalendar': function(e){
		if(e.target.class =="fc.content"){
			console.log(e.target)
		}
	},
});

getMinHotels = function(hf){

	var minHotels = [];
	_.forEach(hf, function(hff){
		var minhp = Infinity;
		var minHP = "";
		var minhotP = {};
		var temphf = hff;
		var minap = {};

		_.forEach(hff.hotelFare.results, function(hp){
			if(hp.total_price.amount < minhp){
				minhp = hp.total_price.amount;
				minHP = hp.property_code;
				minhotP = hp;
			}
		});

		temphf.hotelFare.results = minhotP;
		minHotels.push(temphf);

	});

	return minHotels
}

Template.options.helpers({
	hasCar : function(){
		if(Session.get("cheapestLiveCar")){
			return true
		}
		else{
			return false
		}
	},
})