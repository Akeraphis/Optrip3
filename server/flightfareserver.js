var apiKey = "cl675979726025908356913469447815";
var dateFlightRefresh = 5;
var urlAPIStructure = "https://api-dev.fareportallabs.com/air/api/search/searchflightavailability";
import { base64 } from 'meteor/ostrio:base64';


Meteor.methods({

	getPlaceAutosuggest : function(query, currency, locale, market){
		// http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/{market}/{currency}/{locale}/?query={query}&apiKey={apiKey}

		var url = "http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/"+  market + "/" + currency + "/" +locale + "/?query="+query+"&apiKey="+apiKey ;

		try{
			var response = HTTP.call('GET',url);
        	return response.data;
		}
    	catch(e){
        	console.log(e);
    	}
	},		

});

getFlightFares = function(codeDep, codeArr, departureDate, returnDate, currency, locale, market, FPUsername, FPPassword){

	//old skyscanner_url
	//var skyscanner_url = "http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/"+market+"/"+currency+"/"+locale+"/"+codeDep+"/"+codeArr+"/"+departureDate+"/"+returnDate+"?apiKey="+apiKey;

	//Fareportal implementation
	//Create Authorization header
	const nativeB64 = new base64({ useNative: true });
	var svcCredentials = nativeB64.encode(FPUsername + ":" + FPPassword);
	console.log("encoded logins : ", svcCredentials);
	var headers = {
		"Authorization": "Basic " + svcCredentials,
		"Content-Type": "application/json"
	};
	//Create request body
	var body = {
		"ResponseVersion": "VERSION41",
		"FlightSearchRequest": {
			"Adults": "1",
			"Child": "0",
			"ClassOfService": "ECONOMY",
			"InfantInLap": "0",
			"InfantOnSeat": "0",
			"Seniors": "0",
			"TypeOfTrip": "ROUNDTRIP",
			"SegmentDetails": [
				{
				"DepartureDate": "2018-10-28",
				"DepartureTime": "0000",
				"Destination": "NYC",
				"Origin": "LON"
				},
				{
				"DepartureDate": "2018-11-07",
				"DepartureTime": "0000",
				"Destination": "LON",
				"Origin": "NYC"
				}
			]
		}
	};
	//---

	console.log("The params are : ", headers, body);
	try{
		var res = HTTP.call('POST', urlAPIStructure, [headers, body]);
		
	}
	catch(e){
		console.log(e);
	}
	return res;
    
};

getFlightFaresInCollection = function(codeDep, codeArr, departureDate, returnDate, currency, locale, market, FPUsername, FPPassword){

	var dateNow = new Date();
	var dateThreshold = new Date();
	dateThreshold.setDate(dateNow.getDate()-dateFlightRefresh);
	var ffs = [];

	//For all the possible traversed cities
	_.forEach(codeArr, function(ca){

		var res = FlightFares.findOne({departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate});

		// S'il y a une correspondance et que la mise à jour a eu lieu récemment
		if(res && res.dateUpdate >= dateThreshold ){
			//Just retrieve the field
			ffs.push(res);

		}
		else if(res && res.dateUpdate < dateThreshold){
			//Remove the field and Retrieve
			var ff = getFlightFares(codeDep, ca.code, departureDate, returnDate, currency, locale, market, FPUsername, FPPassword);
			var result = FlightFares.update({ departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate}, {dateUpdate : dateNow, flightFare : ff });
			ffs.push({ departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, dateUpdate : dateNow, flightFare : ff });
			console.log("alert flight to be refreshed");

		}
		else{
			//Enter the missing search in the table and retrieve the result
			var ff = getFlightFares(codeDep, ca.code, departureDate, returnDate, currency, locale, market, FPUsername, FPPassword);
			var result = FlightFares.insert({ departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, dateUpdate : dateNow, flightFare : ff });
			ffs.push({ departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, dateUpdate : dateNow, flightFare : ff });
			console.log("alert flight no entry");
		}
	});

	return ffs;
};