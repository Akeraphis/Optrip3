var amadeusAPIKey = "HSGrlULdIappATMn3SRIrL0H80cO4Sll";
var dateFlightRefresh = 8;
var perimeterHotelInKm = 42;

Meteor.methods({
	getAmadeusHotelFare : function(ip, checkin, checkout, currency, nbAdults, nbChildren, nbInfants){
		var url = "https://api.sandbox.amadeus.com/v1.2/hotels/search-circle";

		var search = HTTP.call('GET', url, {
			params : {
				apikey: amadeusAPIKey,
				latitude: ip.lat,
				longitude: ip.lng,
				radius: perimeterHotelInKm,
				check_in: checkin,
				check_out: checkout,
				currency: currency
			}
		});
		
		return search;
	},
	getAmadeusHotelFareInCollection : function(ip, checkin, checkout, currency, nbAdults, nbChildren, nbInfants){
		var dateNow = new Date();
		var dateThreshold = new Date();
		dateThreshold.setDate(dateNow.getDate()-dateFlightRefresh);
		var ffs = {};

		var res = HotelFares.findOne({location : ip, checkin : checkin, checkout : checkout});

		// S'il y a une correspondance et que la mise à jour a eu lieu récemment
		if(res && res.dateUpdate >= dateThreshold ){
			//Just retrieve the field
			ffs = res;

		}
		else if(res && res.dateUpdate < dateThreshold){
			//Remove the field and Retrieve
			var ff = Meteor.call("getAmadeusHotelFare", ip, checkin, checkout, currency, nbAdults, nbChildren, nbInfants);
			HotelFares.update({ location : ip, checkin : checkin, checkout : checkout}, {dateUpdate : dateNow, hotelFare : ff.data });
			ffs = { location : ip, checkin : checkin, checkout : checkout, dateUpdate : dateNow, hotelFare : ff.data };
			console.log("alert hotel price refresh");
		}
		else{
			//Enter the missing search in the table and retrieve the result
			var ff = Meteor.call("getAmadeusHotelFare", ip, checkin, checkout, currency, nbAdults, nbChildren, nbInfants);
			ffs = { location : ip, checkin : checkin, checkout : checkout, dateUpdate : dateNow, hotelFare : ff.data };
			HotelFares.insert({ location : ip, checkin : checkin, checkout : checkout, dateUpdate : dateNow, hotelFare : ff.data });
			console.log("alert hotel price no entry");
		}
		return ffs;
	},
})