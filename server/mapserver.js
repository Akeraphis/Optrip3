//Définition des clés API
var skyScannerKey = 'cl675979726025908356913469447815';
var googleKey = 'AIzaSyBa-oHgHxxTBaIhoFz8koYTBlHcuCyfiIk';
var FPUsername = "jeanbaptiste.clouard@gmail.com";
var FPPassword = "82C2FC1F";

//Meteor.startup(function() { Kadira.connect('d62MSQCbwpDxdN4z3', '7f107ad7-8c15-493d-8875-813b7cea7410'); });

Meteor.methods({
	optimizeTrip: function(departureFrom, depDate, ipDays, currency, nbPerson, nbChildren, nbInfants, locale, market){

		var optimalTrip = [];
		var departureDate = makeDate(depDate).yyyymmdd();
		var lfp = {};
		var clfp = {};

		//Get ip
		var ip = Meteor.call('getIp', ipDays);

		//Get total Days
		var totalDays = Meteor.call('getTotalDays', ipDays);

		//Add Date to YYYY-MM-DD
		var returnDate = Meteor.call('addToYYYYMMDD', departureDate, totalDays);

		//Get ip and retrieve user progress
		var prog = ProgressionUsers.findOne({ user : this.connection.clientAddress});

		//Step 1. Get locations of departure	
		var codeDep = departureFrom.Airports;
		console.log(codeDep);
		Meteor.call("updateProgress", 2, "Retrieving possibilities");
		console.log("---- Step 1 completed : Code of location of departure retrieved ----");
		
		//Step 2. Get locations of arrivals
		var codeArr = Meteor.call('getCodeArr', ipDays, currency, locale, market);
		console.log(codeArr);
		console.log("---- Step 2 completed : Code of locations of arrivals retrieved ----");
		Meteor.call("updateProgress", 5, "Browsing through flight fares");

		//Step 3. Get all the possible flights from departures to arrivals in Json format
		var flightTable = getFlightFaresInCollection(codeDep, codeArr, departureDate, returnDate, currency, locale, market, FPUsername, FPPassword);
		console.log("---- Step 3 completed : Flights Fares retrieved ----");
		Meteor.call("updateProgress", 10, "Retrieving Hotels and Car fares");

		/*
		//If it is at least a 2-stop trip
		if(codeArr.length>=2){
			//Step 4. Get the circuit
			var optimalCircuit = Meteor.call("orderIps", ipDays);
			console.log("---- Step 4 completed : Optimal circuit computed ----");
			Meteor.call("updateProgress", 20, "Updating the fares from various sources");

			//Step 5. Get all the possible hotel and car rates for the trip
			var refreshRates = Meteor.call("updateFares", codeArr, optimalCircuit, departureDate, returnDate, flightTable, currency, nbPerson, nbChildren, nbInfants, locale, market, function(err, res){
				if(!err){
					console.log("---- Step 7 completed : Fares computed computed ----");
					Meteor.call("updateProgress", 50, "Computing the optimal trip");
					//Step 6. Compute all trip possibilities and results and return the cheapest option
					optimalTrip = Meteor.call("findOptimalTrip", codeArr, optimalCircuit, departureDate, returnDate, flightTable, currency, nbPerson, nbChildren, nbInfants, locale, market);
					console.log("---- Step 8 completed : Optimal trip computed ----");
					Meteor.call("updateProgress", 80, "Getting live flight and hotel fares");
				}
				else{
					console.log(err);
				}
			});

			//Step 6. Get the live flight prices
			lfp = Meteor.call("getLiveFlightFaresInCollection", codeDep, optimalTrip[1][0][1].code, departureDate, returnDate, currency, nbPerson, nbChildren, nbInfants, locale, market);
			console.log("---- Step 9 completed : Live flight prices retrieved ----");
			Meteor.call("updateProgress", 85, "Getting live flight and hotel fares");

			//Step 7. Restructure lfp
			clfp = Meteor.call("restructureLfp", lfp);
			console.log("---- Step 10 completed : Live flight restructured ----");
			Meteor.call("updateProgress", 90, "Rendering results");

			//Step 7. Get the Hotels live prices
			var lhp = Meteor.call("getHotelsLivePrices", optimalTrip[1][2][1], departureDate, returnDate, currency, nbPerson, nbChildren, nbInfants, locale, market);
			console.log("---- Step 11 completed : Live hotels retrieved ----");
			Meteor.call("updateProgress", 95, "Rendering results");
		}				
		
		//if it a one stop trip
		else if(codeArr.length==1){

			//Step 6. Get the live flight prices
			lfp = Meteor.call("getLiveFlightFaresInCollection", codeDep, codeArr[0].code, departureDate, returnDate, currency, nbPerson, nbChildren, nbInfants, locale, market);
			console.log("---- Step 9 completed : Live flight prices retrieved ----");
			Meteor.call("updateProgress", 85, "Getting live flight and hotel fares");

			//Step 7. Restructure lfp
			clfp = Meteor.call("restructureLfp", lfp);
			console.log("---- Step 10 completed : Live flight restructured ----");
			Meteor.call("updateProgress", 90, "Rendering results");

			//Step 7. Get the Hotels live prices
			var ip = [codeArr[0].ip]
			ip[0].checkin = departureDate;
			ip[0].checkout = returnDate;
			var lhp = Meteor.call("getHotelsLivePrices", ip, departureDate, returnDate, currency, nbPerson, nbChildren, nbInfants, locale, market);
			console.log("---- Step 11 completed : Live hotels retrieved ----");
			Meteor.call("updateProgress", 95, "Rendering results");

			optimalTrip = [100, [flightTable, [0,,,,] , [lhp[0].data.hotels_prices[0].agent_prices[0].price_total, lhp[0]]], codeArr, codeArr];
		}*/

		//Step 10. Call car rental live prices for selected starting IP
		//var HA = Meteor.call("searchHomeAway", optimalTrip[1][2][1], departureDate, returnDate, currency, nbPerson, nbChildren, nbInfants, locale, market, function(err,res){if(err){console.log(err)}});
		//Step 11. Return : trip flights to starting IP selected, car rentals to starting IP selected, hotels list for each IP on each day selected

		//return [optimalTrip, clfp, lhp]
		return [flightTable, codeArr]
	},

	refreshTrip: function(departureFrom, depDate, ipDays, currency, nbPerson, nbChildren, nbInfants, locale, market){

		var optimalTrip = [];
		var departureDate = makeDate(depDate).yyyymmdd();
		var lfp = {};
		var clfp = {};

		//Get ip
		var ip = Meteor.call('getIp', ipDays);

		//Get total Days
		var totalDays = Meteor.call('getTotalDays', ipDays);

		//Add Date to YYYY-MM-DD
		var returnDate = Meteor.call('addToYYYYMMDD', departureDate, totalDays);
		
		//Step 1. Get locations of departure	
		var Dep = AutoSuggest.findOne({PlaceName: departureFrom});
		var codeDep = Dep.PlaceId;
		console.log("---- Step 1 completed : Code of location of departure retrieved ----");
		
		//Step 2. Get locations of arrivals
		var codeArr = Meteor.call('getCodeArr', ipDays, currency, locale, market);
		console.log("---- Step 2 completed : Code of locations of arrivals retrieved ----");

		//Step 3. Get all the possible flights from departures to arrivals in Json format
		var flightTable = getFlightFaresInCollection(codeDep, codeArr, departureDate, returnDate, currency, locale, market, FPUsername, FPPassword);
		console.log("---- Step 3 completed : Flights Fares retrieved ----");

		//Step 5. Get all the possible hotel and car rates for the trip
		var optimalTrip = Meteor.call("refreshTrip", codeArr, departureDate, returnDate, flightTable, currency, nbPerson, nbChildren, nbInfants, locale, market);

		//Step 6. Get the live flight prices
		lfp = Meteor.call("getLiveFlightFaresInCollection", codeDep, optimalTrip[1][0][1].code, departureDate, returnDate, currency, nbPerson, nbChildren, nbInfants, locale, market);
		console.log("---- Step 9 completed : Live flight prices retrieved ----");

		//console.log("---- Step 9 completed : Hotel Details retrieved ----");
		clfp = Meteor.call("cheapestLfp", lfp);

		//Step 7. Replace cheapest price
		var newFlightPrice = clfp.Itineraries.PricingOptions.Price;

		//Step 10. Call car rental live prices for selected starting IP

		//Step 11. Return : trip flights to starting IP selected, car rentals to starting IP selected, hotels list for each IP on each day selected

		return [optimalTrip, clfp, newFlightPrice];
	},

	//return ip from ipDays
	getIp : function(ipDays){

		var ip = [];

		_.forEach(ipDays, function(ipd){
			ip.push(ipd.ip);
		});

		return ip;
	},

	//return total days from ip
	getTotalDays : function(ipDays){

		var totalDays = 0;

		_.forEach(ipDays, function(ipd){
			totalDays = totalDays + parseInt(ipd.nbDays);
		});

		return totalDays;
	},

	addToYYYYMMDD : function(startDate, number){

		var depDate = makeDate(startDate);
		var returnD = depDate;
		returnD.setDate(depDate.getDate() + number);
		var returnDate = returnD.yyyymmdd();

		return returnDate;
	},

	getCodeArr : function(ipDays, currency, locale, market){

		var codeArr = [];

		_.forEach(ipDays, function(ipa){
			// Meteor.call("getPlaceAutosuggest", ipa.ip.city, currency, locale, market, function(err, result){
			// 	if(err){
			// 		console.log(err);
			// 	}
			// 	else{
			// 		if(result){
			// 			codeArr.push({ip : ipa.ip, code : result.Airports, nbDays : ipa.nbDays});
			// 		}
			// 	}
			// });
			codeArr.push({ip : ipa.ip, code : ipa.ip.Airports, nbDays : ipa.nbDays})
		});

		return codeArr;
	},

	getUniqueValues: function(array){
		var n = {},r=[];
		_.forEach(array, function(array){
			if (!n[array]){
				n[array] = true; 
				r.push(array); 
			}
		});
		return r;
	},

	updateIpDays : function(ips, days){

		var selectedIpDays = [];

		for (var i=0; i<days.length; i++){
			var obj =  {
				ip : ips[i], 
				nbDays : parseInt(days[i],10)
			};
			selectedIpDays.push( obj );
		}

		return selectedIpDays;
	},

	findCircuitSync : function(ips){

		var SyncCircuit = Meteor.wrapAsync(findCircuitAsync);
		try {
			return SyncCircuit(ips);
		}
		catch (e) {
			console.log('erreur', e.message);
			throw new Meteor.Error(500, e);
		}
	},

	getDistances : function(ip1, ip2){

		var url = "https://maps.googleapis.com/maps/api/distancematrix/json?origins="+ip1.lat+","+ip1.lng+"&destinations="+ip2.lat+","+ip2.lng+"&key="+googleKey;
		response = HTTP.get(url);
		return response.data.rows[0].elements[0].distance.value;
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
	getIpAddress : function(){
		return this.connection.clientAddress;
	},
	updateProgress : function(newProgress, newOperation){
		var ip = this.connection.clientAddress;
		ProgressionUsers.update({user : ip}, {$set : {progress : newProgress, operation : newOperation}});
	}
})

var findCircuitAsync = function(ips, cb){
	setTimeout(function() {
		if (ips) {
			cb && cb(null, ips);
		} 
		else {
			cb && cb('no IP has been selected');
		}
	}, 4000);
};

