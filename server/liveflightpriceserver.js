//var apiKey = "cl675979726025908356913469447815";
var apiKey = "prtl6749387986743898559646983194";
var market = "FR";
var locale = "en-GB";
var dateFlightRefresh = 1;
var nbChildren = 0;
var nbInfants = 0;

Meteor.methods({
	getLiveFlightPrices : function(codeDep, ca, departureDate, returnDate, currency, nbAdults){
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

	getLiveFlightPrices2 : function(codeDep, ca, departureDate, returnDate, currency, nbAdults){
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

	getLiveFlightFaresInCollection : function(codeDep, ca, departureDate, returnDate, currency, nbAdults){

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
			var ff = getLiveFlightPrices2(codeDep, ca, departureDate, returnDate, currency, nbAdults);
			LiveFlightPrices.update({ departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate}, {dateUpdate : dateNow, flightFare : ff });
			ffs = { departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, dateUpdate : dateNow, flightFare : ff };
			console.log("alert live flight price no entry");
		}
		else{
			//Enter the missing search in the table and retrieve the result
			var ff = getLiveFlightPrices2(codeDep, ca, departureDate, returnDate, currency, nbAdults);
			ffs = { departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, dateUpdate : dateNow, flightFare : ff };
			LiveFlightPrices.insert({ departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, dateUpdate : dateNow, flightFare : ff });
			console.log("alert live flight price no entry");

		}
		return ffs;
},
});

