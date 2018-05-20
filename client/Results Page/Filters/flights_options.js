var toBeDisplayed = 15;

Template.nbStops.events({
	'click .list-group' : function(e){
		var airports = getSelectedAirports();
		filterFlights(document.getElementById("direct").checked, document.getElementById("oneStop").checked, document.getElementById("twoStops").checked, $("#durationFlight").data("ionRangeSlider").result.from, $("#durationFlight").data("ionRangeSlider").result.to, airports);
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
		var ff = Session.get("allLiveFlights");
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
		var inboundleg = itin.itineraries[0].inbound;
		var outboundleg = itin.itineraries[0].outbound;
		var durationLegIn = getFlightDuration(inboundleg.flights[0].departs_at, inboundleg.flights[inboundleg.flights.length-1].arrives_at);
		var durationLegOut = getFlightDuration(outboundleg.flights[0].departs_at, outboundleg.flights[outboundleg.flights.length-1].arrives_at);
	
		if(durationLegIn<min){
			min = durationLegIn;
		}
		else if(durationLegIn>max){
			max = durationLegIn;
		}
		else if(durationLegOut<min){
			min = durationLegOut;
		}
		else if(durationLegOut>max){
			max = durationLegOut;
		}
	});

	var minDur = Math.round(min/30)/2;
	var maxDur = Math.round(max/30)/2;

	var minDur = 1;
	var maxDur = 40;

	return [minDur, maxDur]
};

filterFlights = function(direct, oneStop, twoStops, minDuration, maxDuration, airports){
	var ff = Session.get("allLiveFlights");
	var resItin = [];

	_.forEach(ff, function(itin){
		var inboundleg = itin.itineraries[0].inbound;
		var outboundleg = itin.itineraries[0].outbound;
		var countSegIn = inboundleg.flights.length;
		var countSegOut = outboundleg.flights.length;
		var durationLegIn = getFlightDuration(inboundleg.flights[0].departs_at, inboundleg.flights[inboundleg.flights.length-1].arrives_at);
		var durationLegOut = getFlightDuration(outboundleg.flights[0].departs_at, outboundleg.flights[outboundleg.flights.length-1].arrives_at);
		var depOutbound = outboundleg.flights[0].origin.airport;
		var arrInbound = inboundleg.flights[countSegIn-1].destination.airport;
		var maxFlightPrice = Infinity;

		//filtered out if not direct
		if(!direct && (countSegIn==1 || countSegOut==1)){}
		//filtered out if not one stop
		else if(!oneStop && (countSegIn==2 || countSegOut==2)){}
		//filtered out for legs with more than 2 stops
		else if(!twoStops && (countSegIn>2 || countSegOut>2)){}
		//filtered out if leg in is not in duration range
		else if(durationLegIn<minDuration || durationLegIn>maxDuration){}
		//same for leg out
		else if(durationLegOut<minDuration || durationLegOut>maxDuration){}
		//filtered if not in the authorized airports
		else if(sanitycheckAirport(airports, depOutbound, arrInbound)){}
		//if not skimmed out by filters then add to the selection list
		else{
			resItin.push(itin);
			maxFlightPrice = resItin[resItin.length-1].fare.total_price;
		}
	});


	Session.set("selectedLiveFlights", resItin.sort(function(a,b){
		if(parseInt(a.fare.total_price)>parseInt(b.fare.total_price)){
			return 1;
		}
		if(parseInt(a.fare.total_price)<parseInt(b.fare.total_price)){
			return -1;
		}
		else{
			return 0;
		}
	}));
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

getSelectedAirports = function(){
	var airports = document.getElementsByName("airportSelected");
	var res = [];

	_.forEach(airports, function(air){
		console.log(air);
		if(air.checked==true){
			res.push(air.id);
		}
	})

	return res;
};

getFlightDuration = function(dep, arr){
	var hours = moment
        .duration(moment(arr, 'YYYY-MM-DDTHH:mm')
        .diff(moment(dep, 'YYYY-MM-DDTHH:mm'))
        ).asHours();

    return hours;
};