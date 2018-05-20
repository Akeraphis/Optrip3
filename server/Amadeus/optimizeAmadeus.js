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
		var uniqueTabFF = uniqueTable(allFlightFares);
		console.log("---- Step 2 completed : Flights Fares retrieved ----");
		Meteor.call("updateProgress", 10, "Retrieving Car fares");
		//-------------------

		//Step 3. Retrieve all car fares
		var allCarFares = getAllCarFares(allArrivalAirports, depDate, returnDate, currency);
		var uniqueTabCF = uniqueTable(allCarFares);
		console.log("---- Step 3 completed : Car fares retrieved ----");
		Meteor.call("updateProgress", 15, "Calculating the cheapest car, flight option");
		//-------------------

		//Step 4. Find the cheapest flight/car combination in the lot
		var minFlightAndCar = findCheapestFlightAndCar(allFlightFares, allCarFares, ipDays)
		console.log("---- Step 4 completed : Cheapest flight and car combination found ----");
		Meteor.call("updateProgress", 20, "Ordering the stops");
		//-------------------

		//Step 5. Get the optimal tour
		var optimalTour = Meteor.call("orderIps", ipDays);
		console.log("---- Step 5 completed : Computing the optimal tour ----");
		Meteor.call("updateProgress", 30, "Retrieving Hotel fares");
		//-------------------

		//Step 6. Find the cheapest hotel combination
		var allHotelFares = getAllHotelFares(optimalTour, depDate, returnDate, currency, nbAdults, nbChildren, nbInfants);
		console.log("---- Step 6 completed : Cheapest hotels combinations found ----");
		Meteor.call("updateProgress", 80, "Retrieving Hotel fares");
		//-------------------

		return [departureFrom, depDate, ipDays, allArrivalAirports, uniqueTabFF, uniqueTabCF, minFlightAndCar, allHotelFares];
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

uniqueTable = function(result){
	var res2 =[];

	_.forEach(result, function(resi){
		res2 = res2.concat(resi);
	});

	return res2;
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
			if(parseFloat(cf.cars.estimated_total.amount)<minCarPrice){
				minCarPrice = parseFloat(cf.cars.estimated_total.amount);
				minResCar = cf;
				minResCar.cars = cf.cars;
			}
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
				result.push(transformCarFares(res.carFare.data.results));
			}
			else{
				console.log(err);
			}
		})
	});
	return result;
};

transformCarFares = function(result){
	var res2 = [];
	_.forEach(result, function(cF){
		var temp = cF;
		_.forEach(cF.cars, function(c){
			temp.cars = c;
			res2.push(temp);
		});
	});
	return res2;
};

getAllHotelFares = function(optimalTour, depDate, returnDate, currency, nbAdults, nbChildren, nbInfants){
	var result = [];
	var dayStart = 1;
	var i=0;
	var totalDays = 0;
	var lastres = null;

	for(i=0;i<optimalTour.length;i++){
		if(i==0 && optimalTour[0].nbDays>1){
			var endDays = optimalTour[0].nbDays - dayStart;
			console.log("endDays :", endDays)
			var checkoutFirst = (moment(depDate).add(dayStart, 'd')).format("YYYY-MM-DD");
			var checkinLast  = (moment(returnDate).subtract(endDays, 'd')).format("YYYY-MM-DD");
			result.push(Meteor.call("getAmadeusHotelFareInCollection", optimalTour[0].ip, depDate, checkoutFirst, currency, nbAdults, nbChildren, nbInfants));
			lastres = Meteor.call("getAmadeusHotelFareInCollection", optimalTour[0].ip, checkinLast, returnDate, currency, nbAdults, nbChildren, nbInfants);
		}
		else{
			var checkin = (moment(depDate).add(totalDays, 'd')).format("YYYY-MM-DD");
			var checkout = (moment(checkin).add(optimalTour[i].nbDays, 'd')).format("YYYY-MM-DD");
			result.push(Meteor.call("getAmadeusHotelFareInCollection", optimalTour[i].ip, checkin, checkout, currency, nbAdults, nbChildren, nbInfants));
			totalDays = totalDays + dayStart + optimalTour[i].nbDays -1 ;
		}
	};
	if(lastres){
		result.push(lastres);
	}
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