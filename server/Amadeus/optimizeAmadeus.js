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
		var minFlightAndCar = findCheapestFlightAndCar(allFlightFares, allCarFares)
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

findCheapestFlightAndCar = function(allFlightFares, allCarFares){
	var minPrice = Infinity;
	var res = [];
	var minResCar={};
	var minResFlight={};
	var count = 0;

	_.forEach(allFlightFares, function(ff){
		var minFlightPrice = Infinity;
		var minCarPrice = Infinity;
		_.forEach(ff, function(f){
			if(parseFloat(f.fare.total_price)<minFlightPrice){
				console.log("flight :", f.fare.total_price, minPrice);
				minResFlight = f;
				minFlightPrice = parseFloat(f.fare.total_price);
			}
		});
		_.forEach(allCarFares[count], function(cf){
			_.forEach(cf.cars, function(car){
				if(parseFloat(car.estimated_total.amount)<minCarPrice){
					console.log("car :", car.estimated_total.amount,minPrice);
					minCarPrice = parseFloat(car.estimated_total.amount);
					minResCar = cf;
					minResCar.cars = car;
				}
			});
		});
		if(minFlightPrice+minCarPrice < minPrice){
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