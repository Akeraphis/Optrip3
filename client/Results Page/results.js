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
			return Math.round(res[1][0].price_all_days+(Session.get("minLFP")).Itineraries.PricingOptions.Price+(res[2])[0]);
		}
	},

	minCarPrice : function(){
		var res = Session.get("results");
		if(res.length >1){
			return Math.round(res[1][0].price_all_days);
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

	Meteor.call("cheapestLfp", Session.get("liveFlights"), function(err, res){
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
		var res = Session.get("results");
		if(res.length >1){
			return res[1][0].vehicle;
		}
	},
	minDoors : function(){
		var res = Session.get("results");
		if(res.length >1){
			return res[1][0].doors;
		}
	},
	minManual : function(){
		var res = Session.get("results");
		var manual = false ;
		if(res.length >1){
			manual =res[1][0].manual;
		}
		if(manual){
			return "Manual";
			}
		else{
			return "Not manual";
		}
	},
	minSeats : function(){
		var res = Session.get("results");
		if(res.length >1){
			return res[1][0].seats;
		}
	},
	minFuel : function(){
		var res = Session.get("results");
		if(res.length >1){
			return res[1][0].value_add.fuel.policy;
		}
	},
	minUnlimitedMileage : function(){
		var res = Session.get("results");
		var unlim = false;
		if(res.length >1){
			unlim = res[1][0].value_add.included_mileage.unlimited;
		}
		if(unlim){
			return "Unlimited Mileage";
			}
		else{
			return "Limited Mileage";
		}
	},
	minWebsiteName : function(){
		var res = Session.get("results");
		var web = "";

		if(res.length>1){
			var webid = res[1][0].website_id;
			var Websites = (res[1])[1];

			_.forEach(Websites, function(wb){
				if(wb.id == webid){
					web = wb.name;
				}
			});
		}
		return web;
	},
	minWebsiteImage : function(){
		var res = Session.get("results");
		var webim = "";

		if(res.length>1){
			var webid = res[1][0].website_id;
			var Websites = (res[1])[1];

			_.forEach(Websites, function(wb){
				if(wb.id == webid){
					webim = wb.image_url;
				}
			});
		}
		return webim;
	},
	minCarClass : function(){
		var res = Session.get("results");
		var cc = "";

		if(res.length>1){
			var ccid = res[1][0].car_class_id;
			var Classes = (res[1])[2];

			_.forEach(Classes, function(cl){
				if(cl.id == ccid){
					cc = cl.name;
				}
			});
		}
		return cc;
	},

	minCarPrice : function(){
		var res = Session.get("results");
		if(res.length >1){
			return Math.round(res[1][0].price_all_days);
		}
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		return cur2.Symbol;
	}
});

Template.minHotel.helpers({
	minHotels : function(){
		var res = Session.get("results");
		if(res.length >1){
			return res[2][1];
		}
	},

	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		return cur2.Symbol;
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

Template.displayAllFlight.helpers({
	allItineraries : function(){
		return Session.get("liveFlights").flightFare.Itineraries;
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		return cur2.Symbol;
	}
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
	getIt : function(it){
		//var res = it.InboundLegId + it.OutboundLegId;
		console.log(it);
		return it.InboundLegId
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		return cur2.Symbol;
	}
})

Template.displayAllFlight.events({
	'click .pricingOption': function(e){
		var link = this.DeepLinkUrl;
		var price = this.Price;
		var It = Session.get("liveFlights").flightFare.Itineraries;
		var res = {};

		_.forEach(It, function(itin){
			_.forEach(itin.PricingOptions, function(po){
				if(po.DeepLinkUrl == link && po.Price == price ){
					res = itin;
				}
			})
		});

		console.log(res, this);

		var res2 = getLfp(res, this, Session.get("liveFlights"));
		Session.set("minLFP", res2);
		console.log(Session.get("minLFP"))

	}
});

Template.displayLeg.helpers({
	lfleg : function(legId){
		var res = Session.get("liveFlights").flightFare.Legs;
		var lfleg={};

		_.forEach(res, function(leg){
			if(legId == leg.Id){
				lfleg=leg
			}
		});
		return lfleg
	}
});

Template.displaySegment.helpers({
	lfseg : function(segId){
		var res = Session.get("liveFlights").flightFare.Segments;
		var lfseg={};

		_.forEach(res, function(seg){
			if(segId == seg.Id){
				lfseg=seg
			}
		});
		return lfseg
	},
	getPlace : function(placeId){
		var res = Session.get("liveFlights").flightFare.Places;
		var place={};

		_.forEach(res, function(pl){
			if(placeId == pl.Id){
				place=pl
			}
		});
		return place
	},
	getCar : function(carId){
		var res = Session.get("liveFlights").flightFare.Carriers;
		var carrier={};

		_.forEach(res, function(car){
			if(carId == car.Id){
				carrier=car
			}
		});
		return carrier
	},
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

getLfp = function(itin, po, lfp){

	var clfp = {};
	var inboundleg = {};
	var outboundleg = {};
	var minAgent = {};
	var minAgId = "";
	var minInboundSegments = [];
	var minOutboundSegments = [];
	var minInboundCarriers = [];
	var minOutboundCarriers = [];


	minAgId = po.Agents[0];


	_.forEach(lfp.flightFare.Legs, function(leg){
		if(leg.Id==itin.InboundLegId){
			inboundleg = leg;
		}
		else if (leg.Id == itin.OutboundLegId){
			outboundleg = leg;
		}
	});

	console.log("legs : ", inboundleg, outboundleg);

	_.forEach(lfp.flightFare.Agents, function(ag){
		if(ag.Id==minAgId){
			minAgent = ag;
		}
	});

	_.forEach(lfp.flightFare.Segments, function(seg){
		_.forEach(inboundleg.SegmentIds, function(segid){
			if(segid==seg.Id){
				var segment = {};
				var carrier = {};
				var startPlace = {};
				var endPlace = {};
				var operatingCarrier = {};
				_.forEach(lfp.flightFare.Carriers, function(c){
					if(seg.Carrier==c.Id){
						carrier = c;
					}
					if(seg.OperatingCarrier ==c.Id){
						operatingCarrier =c;
					}
				});
				_.forEach(lfp.flightFare.Places, function(p){
					if(seg.DestinationStation==p.Id){
						endPlace = p;
					}
					if(seg.OriginStation==p.Id){
						startPlace = p;
					}
				});	
				segment = {ArrivalDateTime : seg.ArrivalDateTime, Carrier: carrier, DepartureDateTime : seg.DepartureDateTime, DestinationStation : endPlace, Directionality : seg.Directionality, Duration : seg.Duration, FlightNumber : seg.FlightNumber, Id : seg.Id, JourneyMode : seg.JourneyMode, OperatingCarrier : operatingCarrier, OriginStation : startPlace}
				minInboundSegments.push(segment);	
			}
		});
		_.forEach(outboundleg.SegmentIds, function(segid){
			if(segid==seg.Id && seg.Directionality=="Outbound"){
				var segment = {};
				var carrier = {};
				var startPlace = {};
				var endPlace = {};
				var operatingCarrier = {};
				_.forEach(lfp.flightFare.Carriers, function(c){
					if(seg.Carrier==c.Id){
						carrier = c;
					}
					if(seg.OperatingCarrier ==c.Id){
						operatingCarrier =c;
					}
				});
				_.forEach(lfp.flightFare.Places, function(p){
					if(seg.DestinationStation==p.Id){
						endPlace = p;
					}
					if(seg.OriginStation==p.Id){
						startPlace = p;
					}
				});	
				segment = {ArrivalDateTime : seg.ArrivalDateTime, Carrier: carrier, DepartureDateTime : seg.DepartureDateTime, DestinationStation : endPlace, Directionality : seg.Directionality, Duration : seg.Duration, FlightNumber : seg.FlightNumber, Id : seg.Id, JourneyMode : seg.JourneyMode, OperatingCarrier : operatingCarrier, OriginStation : startPlace}
				minOutboundSegments.push(segment);
			}
		});
	});

	clfpItin = {InboundLegId : itin.InboundLegId, OutboundLegId : itin.OutboundLegId, PricingOptions : po, Agents : minAgent};
	inboundleg = {Arrival : inboundleg.Arrival, Departure : inboundleg.Departure, Directionality : inboundleg.Directionality, Duration : inboundleg.Duration, JourneyMode : inboundleg.JourneyMode, Segments : minInboundSegments};
	outboundleg = {Arrival : outboundleg.Arrival, Departure : outboundleg.Departure, Directionality : outboundleg.Directionality, Duration : outboundleg.Duration, JourneyMode : outboundleg.JourneyMode, Segments : minOutboundSegments};
	clfp = {arrivalCode : lfp.arrivalCode, departureCode : lfp.departureCode, departureDate : lfp.departureDate, returnDate: lfp.returnDate, Currencies : lfp.flightFare.Currencies, Itineraries : clfpItin, InboundLeg : inboundleg, OutboundLeg : outboundleg}
	return clfp;
}