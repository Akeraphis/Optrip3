var amadeusAPIKey = "HSGrlULdIappATMn3SRIrL0H80cO4Sll";

Meteor.methods({
	getAmadeusFlightLowFare : function(codeDep, optimalTrip, departureDate, returnDate, currency, nbPerson, nbChildren, nbInfants, locale, market){
		var url = "http://api.sandbox.amadeus.com/v1.2/flights/low-fare-search"


		var search = HTTP.call('GET', url, {
			params : {
				apikey: amadeusAPIKey,
				origin: "PAR",
				destination: "FLR",
				departure_date: departureDate,
				return_date: returnDate,
				adults: nbPerson,
				children: nbChildren,
				infants: nbInfants,
				currency: currency
			}
		});

		return search;
	}
})