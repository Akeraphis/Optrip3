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
		if (Session.get("minTotalPrice")<Infinity){
		//if (Session.get("minLFP").Itineraries){
			return true;
		}
		else{
			return false;
		}
	},
	gotLiveFlight : function(){
		if (Session.get("minLFP").Itineraries){
			return true;
		}
		else{
			return false;
		}
	}
});

Template.minPrice.helpers({

	minTotalPrice : function(){
		var res = Session.get("results");
		if(res.length >1 && Session.get("minLFP").Itineraries){
			return Math.round(Session.get("selectedLiveCars").carFare.cars[0].price_all_days+(Session.get("minLFP")).Itineraries.PricingOptions.Price+(res[2])[0]);
		}
	},

	minCarPrice : function(){
		var res = Session.get("results");
		if(res.length >1){
			return Math.round(Session.get("selectedLiveCars").carFare.cars[0].price_all_days);
		}
	},

	minFlightPrice : function(){
		var res = (Session.get("minLFP"));
		if(res.Itineraries){
			return Math.round(res.Itineraries.PricingOptions.Price*Session.get('nbPersons'));
		}
	},

	minHotelPrices : function(){
		var res = Session.get("results");
		var hp = [];
		if(res.length >1){
			return Math.round((res[2])[0]);
		}
	},

	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		return cur2.Symbol;
	},

	nbPersons : function(){
		return Session.get('nbPersons');
	},
});

Template.minFlight.helpers({

	minLiveFlight : function(){
		var res = Session.get("minLFP");
		return res;
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		return cur2.Symbol;
	}
});

Template.minPrice.onRendered(function(){

	Meteor.call("cheapestLfp", Session.get("selectedLiveFlights"), function(err, res){
		if (!err){
			if(res.Currencies.length >=1){
				Session.set("minLFP", res)
			}
		}
	});
})

Template.leg.helpers({
	getDepDate: function(){	
		var depDateTime = this.DepartureDateTime;
		return depDateTime.substring(0, depDateTime.indexOf("T"));
	},
	getDepTime: function(){
		var depDateTime = this.DepartureDateTime;
		return depDateTime.substring(depDateTime.indexOf("T")+1);
	},
	getArrDate: function(){
		var depDateTime = this.ArrivalDateTime;
		return depDateTime.substring(0, depDateTime.indexOf("T"));
	},
	getArrTime: function(){
		var depDateTime = this.ArrivalDateTime;
		return depDateTime.substring(depDateTime.indexOf("T")+1);
	}
})

Template.minCar.helpers({

	minVehicle : function(){
		return (Session.get("selectedLiveCars").carFare.cars)[0];	
	},
	getManual : function(manual){
		if(manual){
			return "Manual";
			}
		else{
			return "Not manual";
		}
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		return cur2.Symbol;
	},
	getVehicleImage : function(imId){
		var res = Session.get("selectedLiveCars").carFare.images;
		var imUrl = "";

		_.forEach(res, function(im){
			if(im.id==imId){
				imUrl = im.url;
			}
		});

		return imUrl;
	},
	getCarClass :function(car_class_id){
		var res = Session.get("selectedLiveCars").carFare.car_classes;
		var cc = "";

		_.forEach(res, function(im){
			if(im.id==car_class_id){
				cc = im.name;
			}
		});

		return cc;
	},
	getWebsiteImage : function(imId){
		var res = Session.get("selectedLiveCars").carFare.websites;
		var imUrl = "";

		_.forEach(res, function(im){
			if(im.id==imId){
				imUrl = im.image_url;
			}
		});

		return imUrl;
	},
	getDepartureDate : function(){
		return Session.get("selectedLiveCars").departureDate;
	},
	getReturnDate : function(){
		return Session.get("selectedLiveCars").returnDate;
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
		return cur2.Symbol;
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
	}
});

Template.amenities.helpers({
	getHotel : function(hotelId){
		var res ={};
		var slh = Session.get("selectedLiveHotels");

		_.forEach(slh, function(lh){
			_.forEach(lh.data.hotels, function(hot){
				if(hot.hotel_id==hotelId){
					res = hot;
				}
			})
		});

		return res;
	}
});

Template.allImages.helpers({
	getHotel : function(hotelId){
		var res ={};
		var slh = Session.get("selectedLiveHotels");

		_.forEach(slh, function(lh){
			_.forEach(lh.data.hotels, function(hot){
				if(hot.hotel_id==hotelId){
					res = hot;
				}
			})
		});

		return res;
	},
})

Template.carrouselPictures.helpers({
	getHotel : function(hotelId){
		var res ={};
		var slh = Session.get("selectedLiveHotels");

		_.forEach(slh, function(lh){
			_.forEach(lh.data.hotels, function(hot){
				if(hot.hotel_id==hotelId){
					res = hot;
				}
			})
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

	if(Session.get("minLFP").Itineraries){
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

Template.priceOptions.helpers({
	itin : function(Itineraries){
		return Itineraries
	},
	getAgent : function(agentId){
		var res = Session.get("liveFlights").flightFare.Agents;
		var agent={};

		_.forEach(res, function(ag){
			if(agentId == ag.Id){
				agent=ag
			}
		});
		return agent
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		return cur2.Symbol;
	}
});

getMinHotels = function(hf){

	var minHotels = [];
	_.forEach(hf, function(hff){
		var minhp = Infinity;
		var minHP = "";
		var minhotP = {};
		var temphf = hff;
		var minap = {};

		_.forEach(hff.data.hotels_prices, function(hp){
			_.forEach(hp.agent_prices, function(ap){
				if(ap.price_total < minhp){
					minhp = ap.price_total;
					minHP = hp.id
					minhotP = hp;
					minhotP.agent_prices = ap;
				}
			});
		});

		_.forEach(hff.data.hotels, function(hot){
			if(minHP==hot.hotel_id){
				temphf.data.hotels = hot;
				temphf.data.hotels_prices = minhotP;
				minHotels.push(temphf);
			}
		});
	});

	return minHotels
}