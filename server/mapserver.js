//Définition des clés API
var skyScannerKey = 'cl675979726025908356913469447815';
var googleKey = 'AIzaSyBa-oHgHxxTBaIhoFz8koYTBlHcuCyfiIk';

//Meteor.startup(function() { Kadira.connect('d62MSQCbwpDxdN4z3', '7f107ad7-8c15-493d-8875-813b7cea7410'); });

Meteor.methods({
	optimizeTrip: function(departureFrom, departureDate, ipDays, currency, nbPerson){

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
		var codeArr = Meteor.call('getCodeArr', ipDays, currency);
		console.log("---- Step 2 completed : Code of locations of arrivals retrieved ----");

		//Step 3. Get all the possible flights from departures to arrivals in Json format
		var flightTable = getFlightFaresInCollection(codeDep, codeArr, departureDate, returnDate, currency);
		console.log("---- Step 3 completed : Flights Fares retrieved ----");

		//Step 4. Get all the possible hotel rates for the trip
		//var hotelTable = getHotelFaresInCollection(departureDate, returnDate, ipDays);
		console.log("---- Step 4 completed : Hotel Fares retrieved ----");

		//Step 5. Get the car rental table with all the possible rates in the arrival cities
		//var carTable = getCarFaresInCollection(codeArr, departureDate, returnDate);
		console.log("---- Step 5 completed : Car Fares retrieved ----");

		//Step 6. Get the circuit
		var optimalCircuit = Meteor.call("orderIps", ipDays);
		console.log("---- Step 6 completed : Optimal circuit computed ----");

		//Step 7. Compute all trip possibilities and results and return the cheapest option
		var optimalTrip = Meteor.call("findOptimalTrip", codeArr, optimalCircuit, departureDate, returnDate, flightTable, currency, nbPerson);
		console.log("---- Step 7 completed : Optimal trip computed ----");

		//Step 8. Call live prices for selected flight leg

		//Step 9. Call hotel live prices for selecetd IP days

		//Step 10. Call car rental live prices for selected starting IP

		//Step 11. Return : trip flights to starting IP selected, car rentals to starting IP selected, hotels list for each IP on each day selected
				
		return optimalTrip;
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

		var totalDays = 1;

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

	getCodeArr : function(ipDays, currency){

		var codeArr = [];

		_.forEach(ipDays, function(ipa){
			Meteor.call("getPlaceAutosuggest", ipa.ip.city, currency, function(err, result){
				if(err){
					console.log(err);
				}
				else{
					if(result.Places[0]){
						codeArr.push({ip : ipa.ip, code : result.Places[0].PlaceId, nbDays : ipa.nbDays});
					}
				}
			});
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