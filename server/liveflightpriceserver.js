//var apiKey = "cl675979726025908356913469447815";
var apiKey = "prtl6749387986743898559646983194";
var dateFlightRefresh = 51;

Meteor.methods({
	getLiveFlightPrices : function(codeDep, ca, departureDate, returnDate, currency, nbAdults, nbChildren, nbInfants, locale, market){
		var url = "http://partners.api.skyscanner.net/apiservices/pricing/v1.0/";
		var res2 = {};

		HTTP.call('POST',url,
			{headers : {
				"Content-Type": "application/x-www-form-urlencoded",
				"Accept": "application/json"
			},
			params :{
				"apiKey" : apiKey,
				"country" : market,
				"locale" : locale,
				"currency" : currency,
				"originplace" : codeDep,
				"destinationplace" : ca,
				"outbounddate" : departureDate,
				"inbounddate" : returnDate,
				"locationschema" : "Rnid",
				"cabinclass" : "Economy",
				"adults" : nbAdults,
				"children" : nbChildren,
				"infants" : nbInfants
			}}, function(err, res){
				if(err){
					console.log("error", err);
				}
				else{
					console.log("live flight session key retrieved successfully");
					Meteor._sleepForMs(5000);
	    
					if(res.headers.location){
						var url2 = res.headers.location+"?apiKey="+apiKey;
						res2 = HTTP.call('GET', url2);
						//LiveFlightPrices.insert({ departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, flightFare : res2.data });
						console.log("live flight prices retrieved successfully");
					}
				}
			}
		);
		return res2;
	},

	getLiveFlightPrices2 : function(codeDep, ca, departureDate, returnDate, currency, nbAdults, nbChildren, nbInfants, locale, market){
		var url = "http://partners.api.skyscanner.net/apiservices/pricing/v1.0/";
		var res2 = {};

		var res = HTTP.call('POST',url,
			{headers : {
				"Content-Type": "application/x-www-form-urlencoded",
				"Accept": "application/json"
			},
			params :{
				"apiKey" : apiKey,
				"country" : market,
				"locale" : locale,
				"currency" : currency,
				"originplace" : codeDep,
				"destinationplace" : ca,
				"outbounddate" : departureDate,
				"inbounddate" : returnDate,
				"locationschema" : "Rnid",
				"cabinclass" : "Economy",
				"adults" : nbAdults,
				"children" : nbChildren,
				"infants" : nbInfants
			}}
		);
		console.log("live flight session key retrieved successfully");
		Meteor._sleepForMs(5000);
	    
		if(res.headers.location){
			var url2 = res.headers.location+"?apiKey="+apiKey;
			res2 = HTTP.call('GET', url2);
			console.log("live flight prices retrieved successfully");
		}

		return res2.data;
	},

	getLiveFlightFaresInCollection : function(codeDep, ca, departureDate, returnDate, currency, nbAdults, nbChildren, nbInfants, locale, market){
		console.log("get in collection");
		var dateNow = new Date();
		var dateThreshold = new Date();
		dateThreshold.setDate(dateNow.getDate()-dateFlightRefresh);
		var ffs = {};

		var res = LiveFlightPrices.findOne({departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate});

		// S'il y a une correspondance et que la mise à jour a eu lieu récemment
		if(res && res.dateUpdate >= dateThreshold ){
			//Just retrieve the field
			ffs = res;

		}
		else if(res && res.dateUpdate < dateThreshold){
			//Remove the field and Retrieve
			var ff = Meteor.call("getLiveFlightPrices2",codeDep, ca, departureDate, returnDate, currency, nbAdults, nbChildren, nbInfants, locale, market);
			LiveFlightPrices.update({ departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate}, {dateUpdate : dateNow, flightFare : ff });
			ffs = { departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, dateUpdate : dateNow, flightFare : ff };
			console.log("alert live flight price no entry");
		}
		else{
			//Enter the missing search in the table and retrieve the result
			var ff = Meteor.call("getLiveFlightPrices2",codeDep, ca, departureDate, returnDate, currency, nbAdults, nbChildren, nbInfants, locale, market);
			ffs = { departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, dateUpdate : dateNow, flightFare : ff };
			LiveFlightPrices.insert({ departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, dateUpdate : dateNow, flightFare : ff });
			console.log("alert live flight price no entry");

		}
		return ffs;
	},

	cheapestLfp : function(lfp){
		var clfp = {};
		var clfpItin = {};
		var minPrice = Infinity;
		var inboundleg = {};
		var outboundleg = {};
		var minAgent = {};
		var minAgId = "";
		var minInboundSegments = [];
		var minOutboundSegments = [];
		var minInboundCarriers = [];
		var minOutboundCarriers = [];


		_.forEach(lfp.flightFare.Itineraries, function(itin){
			_.forEach(itin.PricingOptions, function(po){
				if(po.Price<minPrice){
					minPrice = po.Price;
					clfpItin = {InboundLegId : itin.InboundLegId, OutboundLegId : itin.OutboundLegId, PricingOptions : po};
					minAgId = po.Agents[0];
				}
			});
		});

		_.forEach(lfp.flightFare.Legs, function(leg){
			if(leg.Id==clfpItin.InboundLegId){
				inboundleg = leg;
			}
			else if (leg.Id == clfpItin.OutboundLegId){
				outboundleg = leg;
			}
		});

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
					minOutboundSegments.push(segment);
				}
			});
		});

		clfpItin = {InboundLegId : clfpItin.InboundLegId, OutboundLegId : clfpItin.OutboundLegId, PricingOptions : clfpItin.PricingOptions, Agents : minAgent};
		inboundleg = {Arrival : inboundleg.Arrival, Departure : inboundleg.Departure, Directionality : inboundleg.Directionality, Duration : inboundleg.Duration, JourneyMode : inboundleg.JourneyMode, Segments : minInboundSegments};
		outboundleg = {Arrival : outboundleg.Arrival, Departure : outboundleg.Departure, Directionality : outboundleg.Directionality, Duration : outboundleg.Duration, JourneyMode : outboundleg.JourneyMode, Segments : minOutboundSegments};
		clfp = {arrivalCode : lfp.arrivalCode, departureCode : lfp.departureCode, departureDate : lfp.departureDate, returnDate: lfp.returnDate, Currencies : lfp.flightFare.Currencies, Itineraries : clfpItin, InboundLeg : inboundleg, OutboundLeg : outboundleg}
		return clfp;
	},

	restructureLfp : function(lfp){
		_.forEach(lfp.flightFare.Itineraries, function(itin){
			_.forEach(lfp.flightFare.Legs, function(leg){
				if(leg.Id==itin.InboundLegId){
					replaceSegments(leg, lfp.flightFare.Segments);
					replaceCarriers(leg, lfp.flightFare.Carriers);
					replacePlaces(leg, lfp.flightFare.Places);
					itin.InboundLeg = leg;
				}
				else if(leg.Id==itin.OutboundLegId){
					replaceSegments(leg, lfp.flightFare.Segments);
					replaceCarriers(leg, lfp.flightFare.Carriers);
					replacePlaces(leg, lfp.flightFare.Places);
					itin.OutboundLeg = leg;
				}
			});

			_.forEach(itin.PricingOptions, function(po){
				replaceAgent(po, lfp.flightFare.Agents);
			});
		});

		return lfp.flightFare.Itineraries;	
	}
});

replaceSegments = function(leg, segments){
	leg.newSegments = [];
	_.forEach(segments, function(seg){
		_.forEach(leg.SegmentIds, function(segId){
			if(segId==seg.Id){
				leg.newSegments.push(seg);
			}
		});
	});
};

replaceCarriers = function(leg, carriers){
	_.forEach(carriers, function(car){
		_.forEach(leg.OperatingCarriers, function(carri){
			if(car.Id==carri){
				carri.Details = car;
			}
		});
		_.forEach(leg.Carriers, function(carri){
			if(car.Id==carri){
				carri.Details = car;
			}
		});
		_.forEach(leg.newSegments, function(seg){
			if(seg.Carrier==car.Id){
				seg.Carrier=car;
			}
			if(seg.OperatingCarrier==car.Id){
				seg.OperatingCarrier=car;
			}
		});
	});
};

replacePlaces = function(leg, places){
	_.forEach(places, function(pl){
		if(leg.OriginStation==pl.Id){
			leg.OriginStation=pl;
		}
		if(leg.DestinationStation==pl.Id){
			leg.DestinationStation=pl;
		}
		_.forEach(leg.newSegments, function(seg){
			if(seg.OriginStation==pl.Id){
				seg.OriginStation=pl;
			}
			if(seg.DestinationStation==pl.Id){
				seg.DestinationStation=pl;
			}
		});
	});
};

replaceAgent = function(po, agents){
	po.newAgents = [];
	_.forEach(po.Agents, function(ag){
		_.forEach(agents, function(agent){
			if(ag==agent.Id){
				po.newAgents.push(agent);
			}
		});
	});
};