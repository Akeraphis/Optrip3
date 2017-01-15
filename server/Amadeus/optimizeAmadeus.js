Meteor.methods({
	'optimizeTripViaAmadeus' : function(departureFrom, depDate, ipDays, currency, nbAdults, nbChildren, nbInfants, locale, market){

		//--------------------
		//Step 0. Get return Data
		//Get total Days
		var totalDays = Meteor.call('getTotalDays', ipDays);

		//Add Date to YYYY-MM-DD
		var returnDate = Meteor.call('addToYYYYMMDD', depDate, totalDays);

		//Get ip and retrieve user progress
		var prog = ProgressionUsers.findOne({ user : this.connection.clientAddress});

		//Get code Dep
		var codeDep = getCodeDep(departureFrom);
		//-------------------

		//Step 1. Look for all possible relevant airports
		var allArrivalAirports = getAllAirports(ipDays);
		Meteor.call("updateProgress", 2, "Retrieving all arrival airports");
		console.log("---- Step 1 completed : Retrieving flight fares ----");
		//-------------------

		//Step 2. Get all the fares for the selected airports
		var allFlightFares = getAllFlightFares(codeDep, allArrivalAirports, depDate, returnDate, currency, nbAdults, nbChildren, nbInfants);
		console.log("---- Step 2 completed : Flights Fares retrieved ----");
		Meteor.call("updateProgress", 10, "Retrieving Car fares");
		//-------------------

		//Step 3. Retrieve all car fares
		var allCarFares = getAllCarFares(allArrivalAirports, depDate, returnDate, currency);
		console.log("---- Step 3 completed : Car fares retrieved ----");
		Meteor.call("updateProgress", 15, "Calculating the cheapest car, flight option");
		//-------------------

		//Step 4. Find the cheapest flight/car combination in the lot
		var minFlightAndCar = findCheapestFlightAndCar(allFlightFares, allCarFares, ipDays)
		console.log("---- Step 4 completed : Cheapest flight and car combination found ----");
		Meteor.call("updateProgress", 20, "Retrieving Hotel fares");
		//-------------------



		return [departureFrom, depDate, ipDays, allArrivalAirports, allFlightFares, allCarFares, minFlightAndCar];
	},

});

getAllAirports = function(ipDays){
	var allAirports=[];
	_.forEach(ipDays, function(ipd){
		Meteor.call("getAmadeusNearestRelevantAirportInCollection", ipd.ip.lat, ipd.ip.lng, function(err,res){
			if(!err){
				allAirports = getUniqueAirport(allAirports.concat(res.data));
			}
			else{
				console.log(err);
			}
		})
	});
	return allAirports;
};

getUniqueAirport = function(a) {
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i].airport == a[j].airport)
                a.splice(j--, 1);
        }
    }
    return a;
};

getAllFlightFares = function(departureFrom, allArrivalAirports, depDate, returnDate, currency, nbAdults, nbChildren, nbInfants){
	var result = [];
	_.forEach(allArrivalAirports, function(air){
		Meteor.call("getAmadeusFlightLowFareInCollection", departureFrom, air.airport, depDate, returnDate, currency, nbAdults, nbChildren, nbInfants, function(err, res){
			if(!err){
				result.push(res.flightFare.data.results);
			}
			else{
				console.log(err);
			}
		})
	});
	return result;
};

getCodeDep = function(str){
	return str.substring(str.lastIndexOf("[")+1,str.lastIndexOf("]"));
};

findCheapestFlightAndCar = function(allFlightFares, allCarFares, ipDays){
	var minPrice = Infinity;
	var res = [];
	var minResCar={};
	var minResFlight={};
	var count = 0;
	var distanceHotelNightAirport = 100;

	_.forEach(allFlightFares, function(ff){
		var minFlightPrice = Infinity;
		var minCarPrice = Infinity;
		var penaltyHotelNightAirport=150;
		_.forEach(ff, function(f){
			if(parseFloat(f.fare.total_price)<minFlightPrice){
				minResFlight = f;
				minFlightPrice = parseFloat(f.fare.total_price);
			}
		});
		_.forEach(allCarFares[count], function(cf){
			_.forEach(ipDays, function(ipd){
				if(distance(ipd.ip.lat, ipd.ip.lng, cf.location.latitude, cf.location.longitude)<distanceHotelNightAirport){
					penaltyHotelNightAirport=0;
				}
			})
			_.forEach(cf.cars, function(car){
				if(parseFloat(car.estimated_total.amount)<minCarPrice){
					minCarPrice = parseFloat(car.estimated_total.amount);
					minResCar = cf;
					minResCar.cars = car;
				}
			});
		});
		if(minFlightPrice+minCarPrice+penaltyHotelNightAirport < minPrice){
			minPrice = minFlightPrice+minCarPrice;
			res = [minResFlight, minResCar];
		}
		count++;
	});

	return res;
};

getAllCarFares = function(allArrivalAirports, depDate, returnDate, currency){
	var result = [];
	_.forEach(allArrivalAirports, function(air){
		Meteor.call("getAmadeusCarAirportFareInCollection", air.airport, depDate, returnDate, currency, function(err, res){
			if(!err){
				result.push(res.carFare.data.results);
			}
			else{
				console.log(err);
			}
		})
	});
	return result;
};

distance = function(lat1, lon1, lat2, lon2) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	dist = dist * 1.609344;
	return dist
}