var amadeusAPIKey = "HSGrlULdIappATMn3SRIrL0H80cO4Sll";
var dateFlightRefresh = 8;

Meteor.methods({
	getAmadeusFlightLowFare : function(codeDep, codeArr, departureDate, returnDate, currency, nbAdults, nbChildren, nbInfants){
		var url = "https://api.sandbox.amadeus.com/v1.2/flights/low-fare-search"

		var search = HTTP.call('GET', url, {
			params : {
				apikey: amadeusAPIKey,
				origin: codeDep,
				destination: codeArr,
				departure_date: departureDate,
				return_date: returnDate,
				adults: nbAdults,
				children: nbChildren,
				infants: nbInfants,
				currency: currency
			}
		});

		return search;
	},
	getAmadeusFlightLowFareInCollection : function(codeDep, ca, departureDate, returnDate, currency, nbAdults, nbChildren, nbInfants){
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
			var ff = Meteor.call("getAmadeusFlightLowFare", codeDep, ca, departureDate, returnDate, currency, nbAdults, nbChildren, nbInfants);
			LiveFlightPrices.update({ departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate}, {dateUpdate : dateNow, flightFare : ff });
			ffs = { departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, dateUpdate : dateNow, flightFare : ff };
			console.log("alert live flight price refresh");
		}
		else{
			//Enter the missing search in the table and retrieve the result
			var ff = Meteor.call("getAmadeusFlightLowFare", codeDep, ca, departureDate, returnDate, currency, nbAdults, nbChildren, nbInfants);
			ffs = { departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, dateUpdate : dateNow, flightFare : ff };
			LiveFlightPrices.insert({ departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, dateUpdate : dateNow, flightFare : ff });
			console.log("alert live flight price no entry");
		}
		return ffs;
	},
	getAmadeusAirportAutocomplete : function(query){
		var url="https://api.sandbox.amadeus.com/v1.2/airports/autocomplete"

		var search = HTTP.call('GET', url, {
			params : {
				apikey: amadeusAPIKey,
				term: query
			}
		});

		return search;
	},
	getAmadeusFlightExtensiveSearch : function(codeDep, optimalTrip, departureDate, returnDate, currency, nbPerson, nbChildren, nbInfants, locale, market){

		var search = HTTP.call('GET', url, {
			params : {
				apikey: amadeusAPIKey,
				origin: "PAR",
				destination: "FLR",
				departure_date: departureDate
			}
		});

		return search;
	},
})