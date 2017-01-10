var amadeusAPIKey = "HSGrlULdIappATMn3SRIrL0H80cO4Sll";
var dateFlightRefresh = 8;

Meteor.methods({
	getAmadeusCarAirportFare : function(codeArr, departureDate, returnDate, currency){
		var url = "https://api.sandbox.amadeus.com/v1.2/cars/search-airport"

		var search = HTTP.call('GET', url, {
			params : {
				apikey: amadeusAPIKey,
				location: codeArr,
				pick_up: departureDate,
				drop_off: returnDate,
				currency: currency
			}
		});

		return search;
	},
	getAmadeusCarAirportFareInCollection : function(ca, departureDate, returnDate, currency){
		var dateNow = new Date();
		var dateThreshold = new Date();
		dateThreshold.setDate(dateNow.getDate()-dateFlightRefresh);
		var ffs = {};

		var res = CarFares.findOne({location : ca, pick_up : departureDate, drop_off : returnDate});

		// S'il y a une correspondance et que la mise à jour a eu lieu récemment
		if(res && res.dateUpdate >= dateThreshold ){
			//Just retrieve the field
			ffs = res;

		}
		else if(res && res.dateUpdate < dateThreshold){
			//Remove the field and Retrieve
			var ff = Meteor.call("getAmadeusCarAirportFare", ca, departureDate, returnDate, currency);
			CarFares.update({ location : ca, pick_up : departureDate, drop_off : returnDate}, {dateUpdate : dateNow, carFare : ff });
			ffs = { location : ca, pick_up : departureDate, drop_off : returnDate, dateUpdate : dateNow, carFare : ff };
			console.log("alert car price no entry");
		}
		else{
			//Enter the missing search in the table and retrieve the result
			var ff = Meteor.call("getAmadeusCarAirportFare", ca, departureDate, returnDate, currency);
			ffs = { location : ca, pick_up : departureDate, drop_off : returnDate, dateUpdate : dateNow, carFare : ff };
			CarFares.insert({ location : ca, pick_up : departureDate, drop_off : returnDate, dateUpdate : dateNow, carFare : ff });
			console.log("alert car price no entry");
		}
		return ffs;
	},
})