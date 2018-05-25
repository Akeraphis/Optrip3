var googleKey = 'AIzaSyBa-oHgHxxTBaIhoFz8koYTBlHcuCyfiIk';

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
		Meteor.call("updateProgress", 2, "Retrieving all arrival airports");
		//-------------------

		//Step 1. Look for all possible relevant airports
		var allArrivalAirports = getAllAirports(ipDays);
		Meteor.call("updateProgress", 15, "Retrieving Flight fares");
		console.log("---- Step 1 completed : Retrieving flight fares ----");
		//-------------------

		//Step 2. Get all the fares for the selected airports
		var allFlightFares = getAllFlightFares(codeDep, allArrivalAirports, depDate, returnDate, currency, nbAdults, nbChildren, nbInfants);
		var uniqueTabFF = uniqueTable(allFlightFares);
		Meteor.call("updateNbFlights", allFlightFares.length);
		console.log("---- Step 2 completed : Flights Fares retrieved ----");
		Meteor.call("updateProgress", 30, "Retrieving Car fares");
		//-------------------

		//Step 3. Retrieve all car fares
		var allCarFares = getAllCarFares(allArrivalAirports, depDate, returnDate, currency);
		var uniqueTabCF = uniqueTable(allCarFares);
		Meteor.call("updateNbCars", allCarFares.length);
		console.log("---- Step 3 completed : Car fares retrieved ----");
		Meteor.call("updateProgress", 45, "Calculating the cheapest car, flight option");
		//-------------------

		//Step 4. Find the cheapest flight/car combination in the lot
		var minFlightAndCar = findCheapestFlightAndCar(allFlightFares, allCarFares, ipDays)
		console.log("---- Step 4 completed : Cheapest flight and car combination found ----");
		Meteor.call("updateProgress", 60, "Ordering the stops");
		//-------------------

		//Step 5. Get the optimal tour
		var optimalTour = Meteor.call("orderIps", ipDays);
		console.log("---- Step 5 completed : Computing the optimal tour ----");
		Meteor.call("updateProgress", 80, "Retrieving Hotel fares");
		//-------------------

		//Step 6. Find the cheapest hotel combination
		var allHotelFares = getAllHotelFares(optimalTour, depDate, returnDate, currency, nbAdults, nbChildren, nbInfants);
		console.log("---- Step 6 completed : Hotel fares retrieved ----");
		Meteor.call("updateProgress", 90, "Calculating Hotel best deals");
		//-------------------

		//Step 7. Find the cheapest hotel combination
		var cheapestHotelBundle = getCheapestHotels(getAllHotelFares(optimalTour, depDate, returnDate, currency, nbAdults, nbChildren, nbInfants));
		console.log("---- Step 7 completed : Cheapest hotels combinations found ----");
		Meteor.call("updateProgress", 95, "Wrapping up everything together");
		//-------------------

		return [departureFrom, depDate, ipDays, allArrivalAirports, uniqueTabFF, uniqueTabCF, minFlightAndCar, allHotelFares, cheapestHotelBundle];
	},
	updateProgress : function(newProgress, newOperation){
		var ip = this.connection.clientAddress;
		ProgressionUsers.update({user : ip}, {$set : {progress : newProgress, operation : newOperation}});
	},
	updateNbFlights : function(newNbFlights){
		var ip = this.connection.clientAddress;
		ProgressionUsers.update({user : ip}, {$set : {nbFlights: newNbFlights}});
	},
	updateNbCars : function(newNbCars){
		var ip = this.connection.clientAddress;
		ProgressionUsers.update({user : ip}, {$set : {nbCars: newNbCars}});
	},
	updateNbHotels : function(newNbHotels){
		var ip = this.connection.clientAddress;
		ProgressionUsers.update({user : ip}, {$set : {nbFlights: newNHotels}});
	},
	addToYYYYMMDD : function(startDate, number){

		var depDate = makeDate(startDate);
		var returnD = depDate;
		returnD.setDate(depDate.getDate() + number);
		var returnD
		var returnDate = returnD.yyyymmdd();

		return returnDate;
	},
	//return total days from ip
	getTotalDays : function(ipDays){
		var totalDays = 0;

		_.forEach(ipDays, function(ipd){
			totalDays = totalDays + parseInt(ipd.nbDays);
		});

		return totalDays;
	},
	getRoute : function(ipDays){

		var coord = "";

		if(ipDays.length>=2) {

			coord = coord + "|" +  ipDays[0].ip.lat + ","  + ipDays[0].ip.lng
			for (var i=1; i<ipDays.length-1; i++){
				coord = coord + "|" +  ipDays[i].ip.lat + ","  + ipDays[i].ip.lng
			}
			coord = coord + "|" +  ipDays[ipDays.length - 1].ip.lat + ","  + ipDays[ipDays.length - 1].ip.lng
			
			var url = "https://maps.googleapis.com/maps/api/directions/json?origin="+ipDays[0].ip.lat+","+ipDays[0].ip.lng+"&destination="+ipDays[ipDays.length - 1].ip.lat+","+ipDays[ipDays.length - 1].ip.lng+"&waypoints=optimize:true"+ coord +"&key="+googleKey;
		}
		else{

			var url = "https://maps.googleapis.com/maps/api/directions/json?origin="+ipDays[0].ip.lat+","+ipDays[0].ip.lng+"&destination="+ipDays[ipDays.length - 1].ip.lat+","+ipDays[ipDays.length - 1].ip.lng+"&key="+googleKey;
		}

		response = HTTP.get(url);
		return response;
	},

	orderIps : function(ipDays){

		var res = Meteor.call("getRoute", ipDays);
		var res2 = res.data.routes[0].waypoint_order;
		var newOrd = [];

		_.forEach(res2, function(ip){
			newOrd.push(ipDays[ip]);
		});

		return newOrd;
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
			totalDays = totalDays + dayStart;
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

getCheapestHotels = function(allH){
	var res = allH;
	var i=0;

	_.forEach(res, function(city){
		var minPrice = Infinity;
		var temp = {};
		_.forEach(city.hotelFare.results, function(hf){
			if (parseInt(hf.total_price.amount)<minPrice){
				temp = hf;
				minPrice = parseInt(hf.total_price.amount);
			}
		});
		res[i].hotelFare.results = temp;
		i++;
	});
	return res;
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
};

makeDate = function(dateString){

	var year = dateString.substring(0, getPosition(dateString, "-", 1));
	var month = dateString.substring(5, getPosition(dateString, "-", 2));
	var day = dateString.substring(getPosition(dateString, "-", 2)+1, 10);

	var newMonth = (parseInt(month) - 1).toString();

	res = new Date(year, newMonth, day);
	return res
};

getPosition = function(str, m, i) {
   return str.split(m, i).join(m).length;
};

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),'-',
          (mm>9 ? '' : '0') + mm,'-',
          (dd>9 ? '' : '0') + dd
         ].join('');
};