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
		Meteor.call("updateProgress", 10, "Retrieving Hotels and Car fares");
		//-------------------

		return [departureFrom, depDate, ipDays, allArrivalAirports, allFlightFares];
	},

});

getAllAirports = function(ipDays){
	var allAirports=[];
	_.forEach(ipDays, function(ipd){
		Meteor.call("getAmadeusNearestRelevantAirport", ipd.ip.lat, ipd.ip.lng, function(err,res){
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
				result.push(res.flightfare.data.results);
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