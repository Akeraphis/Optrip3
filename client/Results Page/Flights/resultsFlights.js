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

		Session.set("selectedItin", res);
		Session.set("selectedFlightPrice", res2);
		$('#myModal').modal('hide');
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

Template.nbStops.events({
	'click .list-group' : function(e){
		var airports = getSelectedAirports();
		filterFlights(document.getElementById("direct").checked, document.getElementById("oneStop").checked, document.getElementById("twoStops").checked, $("#durationFlight").data("ionRangeSlider").result.from, $("#durationFlight").data("ionRangeSlider").result.to, airports);
		var res = Session.get("selectedLiveFlights")[0]
		var po = res.PricingOptions[0];
		var ag = res.PricingOptions[0].newAgents[0];
		po.Agents = ag;
		res.PricingOptions = po;
		Session.set("minLFP", res);
	},
});

Template.tripLength.onRendered(function(){

	var dur = getMinMaxDuration();

	var $range = $("#durationFlight");

	$range.ionRangeSlider({
	    type: "double",
	    grid: false,
	    min: 0,
	    max: dur[1],
	    from: dur[0],
	    to: dur[1],
	    step: 0.5,
	    postfix: "hours",
	    onFinish: function (data) {
	    	var airports = getSelectedAirports();
			filterFlights(document.getElementById("direct").checked, document.getElementById("oneStop").checked, document.getElementById("twoStops").checked, data.from, data.to, airports);
			var res = Session.get("selectedLiveFlights")[0]
			if(res.InboundLegId){
				var po = res.PricingOptions[0];
				var ag = res.PricingOptions[0].newAgents[0];
				po.Agents = ag;
				res.PricingOptions = po;
			}
			Session.set("minLFP", res);
		},
	});
});

Template.depAirport.helpers({
	'depAirports': function(){
		var ff = Session.get("selectedLiveFlights");
		var res = [];
		var depId = [];

		_.forEach(ff, function(itin){
			if(!containsId(itin.itineraries[0].outbound.flights[0].origin.airport, depId)){
				depId.push(itin.itineraries[0].outbound.flights[0].origin.airport);
				res.push(itin.itineraries[0].outbound.flights[0].origin);
			}
		});

		return res;
	},
});

Template.depAirport.events({
	'click .airport-group' : function(e){
		var airports = getSelectedAirports();
		filterFlights(document.getElementById("direct").checked, document.getElementById("oneStop").checked, document.getElementById("twoStops").checked, $("#durationFlight").data("ionRangeSlider").result.from, $("#durationFlight").data("ionRangeSlider").result.to, airports);
		var res = Session.get("selectedLiveFlights")[0]
	},
});

containsId = function(id, table){
	var res = false;

	_.forEach(table, function(t){
		if(id==t){
			res = true
		}
	});

	return res;
};

getMinMaxDuration = function(){
	var res = Session.get("selectedLiveFlights");
	var min = Infinity;
	var max = 0;

	//In the middle of being changed for Amadeus
	//--
	// _.forEach(res,  function(itin){
	// 	_.forEach(itin.itineraries, function(itin2){
	// 		if(itin2.itineraries.InboundLeg.Duration<min){
	// 			min = itin.InboundLeg.Duration;
	// 		}
	// 		else if(itin.InboundLeg.Duration>max){
	// 			max = itin.InboundLeg.Duration;
	// 		}
	// 		else if(itin.OutboundLeg.Duration<min){
	// 			min = itin.OutboundLeg.Duration;
	// 		}
	// 		else if(itin.OutboundLeg.Duration>max){
	// 			max = itin.OutboundLeg.Duration;
	// 		}
	// 	});
	// });

	// var minDur = Math.round(min/30)/2;
	// var maxDur = Math.round(max/30)/2;

	var minDur = 1;
	var maxDur = 40;

	return [minDur, maxDur]
};

filterFlights = function(direct, oneStop, twoStops, minDuration, maxDuration, airports){
	var ff = Session.get("liveFlights");
	var maxNumber = 30;
	var resItin = [];

	_.forEach(ff, function(itin){
		var inboundleg = itin.InboundLeg;
		var outboundleg = itin.OutboundLeg;
		var countSegIn = inboundleg.SegmentIds.length;
		var countSegOut = outboundleg.SegmentIds.length;
		var durationLegIn = inboundleg.Duration;
		var durationLegOut = outboundleg.Duration;
		var depOutbound = outboundleg.OriginStation.Code;
		var arrInbound = inboundleg.DestinationStation.Code;
		var maxFlightPrice = Infinity;

		//filtered out if not direct
		if(!direct && (countSegIn==1 || countSegOut==1)){}
		//filtered out if not one stop
		else if(!oneStop && (countSegIn==2 || countSegOut==2)){}
		//filtered out for legs with more than 2 stops
		else if(!twoStops && (countSegIn>2 || countSegOut>2)){}
		//filtered out if leg in is not in duration range
		else if(durationLegIn<minDuration*60 || durationLegIn>maxDuration*60){}
		//same for leg out
		else if(durationLegOut<minDuration*60 || durationLegOut>maxDuration*60){}
		//filtered if not in the authorized airports
		else if(sanitycheckAirport(airports, depOutbound, arrInbound)){}
		//if not skimmed out by filters then add to the selection list
		else{
			resItin.push(itin);
			resItin.sort(function(a,b){
				if(a.PricingOptions[0].Price>b.PricingOptions[0].Price){
					return 1;
				}
				if(a.PricingOptions[0].Price<b.PricingOptions[0].Price){
					return -1;
				}
				else{
					return 0;
				}
			});

			if(resItin.length>maxNumber){
				resItin.splice(maxNumber, 1);
			}
			maxFlightPrice = resItin[resItin.length-1].PricingOptions[0].Price;
		}
	});

	ff = resItin;

	Session.set("selectedLiveFlights", ff);
};

sanitycheckAirport = function(airports, depOutbound, arrInbound){
	var resIn = true;
	var resOu = true;
	var res = true;

	_.forEach(airports, function(air){
		if(air==depOutbound){
			resOu = false;
		}
		if(air==arrInbound){
			resIn = false;
		}
	});

	if(!resIn && !resOu){
		res=false;
	}

	return res
};

getAirportFromLeg = function(id){
	var res = [];
	var ff = Session.get("liveFlights");
	_.forEach(ff.flightFare.Places, function(p){
		if(p.Id==id){
			res.push(p.Code);
		}
	});
	return res
};

getSelectedAirports = function(){
	var airports = document.getElementsByName("airportSelected");
	var res = [];

	_.forEach(airports, function(air){
		if(air.checked==true){
			res.push(air.id);
		}
	})

	return res;
};