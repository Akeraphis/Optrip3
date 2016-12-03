//var apiKey = "cl675979726025908356913469447815";
var apiKey = "prtl6749387986743898559646983194";
var market = "FR";
var locale = "en-GB";
var dateFlightRefresh = 1;
var nbChildren = 0;
var nbInfants = 0;

getLiveFlightPrices = function(sessionKey){

    var res = {};

	if(sessionKey){
		var url2 = "http://partners.api.skyscanner.net"+sessionKey;
		try{
			res = HTTP.call('GET', url2);
		}
		catch(e){
			console.log(e);
		}
	}

	return res.data;
};

getLiveFlightSessionKey = function(codeDep, ca, departureDate, returnDate, currency, nbAdults){
	var url = "http://partners.api.skyscanner.net/apiservices/pricing/v1.0/";

	var res = HTTP.call('POST',url,
		{/*headers : {
			"Content-Type": "application/x-www-form-urlencoded",
			"Accept": "application/json"
		},*/
		query :{
			"apiKey" : apiKey,
			"country" : market,
			"locale" : locale,
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
	);/*
		, function(err, res){
			if(err){
				console.log("error", err);
			}
		}
	);*/

	console.log("toto", res);
	return res;
};

getLiveFlightFaresInCollection = function(codeDep, ca, departureDate, returnDate, currency, nbAdults){

	var dateNow = new Date();
	var dateThreshold = new Date();
	dateThreshold.setDate(dateNow.getDate()-dateFlightRefresh);
	var ffs = [];
	var sessionKey = "";

	var res = FlightFares.findOne({departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate});

	// S'il y a une correspondance et que la mise à jour a eu lieu récemment
	if(res && res.dateUpdate >= dateThreshold ){
		//Just retrieve the field
		ffs.push(res);

	}
	else if(res && res.dateUpdate < dateThreshold){
		//Remove the field and Retrieve
		sessionKey = getLiveFlightSessionKey(codeDep, ca, departureDate, returnDate, currency, nbAdults);
		var ff = getLiveFlightSessionKey(sessionKey);
		var result = FlightFares.update({ departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate}, {dateUpdate : dateNow, flightFare : ff });
		ffs.push({ departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, dateUpdate : dateNow, flightFare : ff });
		console.log("alert live flight price to be refreshed");

	}
	else{
		//Enter the missing search in the table and retrieve the result
		sessionKey = getLiveFlightSessionKey(codeDep, ca, departureDate, returnDate, currency, nbAdults);
		var ff = getLiveFlightSessionKey(sessionKey);

		var result = FlightFares.insert({ departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, dateUpdate : dateNow, flightFare : ff });
		ffs.push({ departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, dateUpdate : dateNow, flightFare : ff });
		console.log("alert live flight price no entry");
	}

	return ffs;
};