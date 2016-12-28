Template.displayAllFlight.events({
	'click .pricingOption': function(e){
		var link = this.DeepLinkUrl;
		var price = this.Price;
		//var It = Session.get("selectedLiveFlights").flightFare.Itineraries;
		var It = Session.get("selectedLiveFlights")
		var res = {};

		_.forEach(It, function(itin){
			_.forEach(itin.PricingOptions, function(po){
				if(po.DeepLinkUrl == link && po.Price == price ){
					res = itin;
				}
			})
		});

		if(res.InboundLegId){
			var po = res.PricingOptions[0];
			var ag = res.PricingOptions[0].newAgents[0];
			po.Agents = ag;
			res.PricingOptions = po;
		}
		Session.set("minLFP", res);
		$('#myModal').modal('hide');
	}
});

Template.displayAllFlight.helpers({
	allItineraries : function(){
		//return Session.get("selectedLiveFlights").flightFare.Itineraries;
		return Session.get("selectedLiveFlights")
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		return cur2.Symbol;
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
		var ff = Session.get("liveFlights");
		var res = [];
		var depId = [];

		_.forEach(ff, function(itin){
			if(itin.OutboundLeg.Directionality == "Outbound"){
				if(!containsId(itin.OutboundLeg.OriginStation.Id, depId)){
					depId.push(itin.OutboundLeg.OriginStation.Id);
					res.push(itin.OutboundLeg.OriginStation);
				}
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
		if(res.InboundLegId){
			var po = res.PricingOptions[0];
			var ag = res.PricingOptions[0].newAgents[0];
			po.Agents = ag;
			res.PricingOptions = po;
		}
		Session.set("minLFP", res);
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

	_.forEach(res,  function(itin){
		if(itin.InboundLeg.Duration<min){
			min = itin.InboundLeg.Duration;
		}
		else if(itin.InboundLeg.Duration>max){
			max = itin.InboundLeg.Duration;
		}
		else if(itin.OutboundLeg.Duration<min){
			min = itin.OutboundLeg.Duration;
		}
		else if(itin.OutboundLeg.Duration>max){
			max = itin.OutboundLeg.Duration;
		}
	});

	var minDur = Math.round(min/30)/2;
	var maxDur = Math.round(max/30)/2;

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