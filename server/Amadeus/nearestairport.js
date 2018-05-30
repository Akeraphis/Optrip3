var amadeusAPIKey = "HSGrlULdIappATMn3SRIrL0H80cO4Sll";
var dMax = 100;

Meteor.methods({
	getAmadeusNearestRelevantAirport : function(lat, lng){
		var url="https://api.sandbox.amadeus.com/v1.2/airports/nearest-relevant"

		var search = HTTP.call('GET', url, {
			params : {
				apikey: amadeusAPIKey,
				latitude: lat,
				longitude: lng
			}
		});

		return search;
	},
	getAmadeusNearestRelevantAirportInCollection : function(lat, lng){
		var ffs = {};

		var res = NearestRelevantAirport.findOne({latitude : lat, longitude : lng});

		// S'il y a une correspondance et que la mise à jour a eu lieu récemment
		if(res){
			//Just retrieve the field
			ffs = res.nearest_airports;

		}
		else{
			//Enter the missing search in the table and retrieve the result
			var ffs = Meteor.call("getAmadeusNearestRelevantAirport", lat, lng);
			NearestRelevantAirport.insert({latitude : lat, longitude : lng, nearest_airports : ffs });
			console.log("nearest relevant airport no entry");
		}

		ffs.data = Meteor.call("getAirportsInCircle", lat, lng, ffs.data);
		return ffs;
	},
	getAirportsInCircle : function(lat, lng, airports){
		var res = [];

		_.forEach(airports, function(air){
			if (distance(lat, lng, air.location.latitude, air.location.longitude)<=dMax){
				res.push(air);
			}
		});
		return res;
	}
})