var apiKey = "cl675979726025908356913469447815";
var urlAPIStructure = "https://api-dev.fareportallabs.com/air/api/search/searchflightavailability";
import { base64 } from 'meteor/ostrio:base64';


Meteor.methods({
	getPlaceAutosuggest : function(query, currency, locale, market){
		// http://intellisuggest.fareportal.com/api/IntelliSuggest/2.0/json/AutoSuggest/AIR/ALL/NYC

		var url = "http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/"+  market + "/" + currency + "/" +locale + "/?query="+query+"&apiKey="+apiKey ;
		console.log("-------- Place autosuggest : "+query);

		try{
			var response = HTTP.call('GET',url);
			if (response){
				return response.data;
			}	
		}
    	catch(e){
        	console.log(e);
    	}
	}
});

getFlightFares = function(codeDep, codeArr, departureDate, returnDate, currency, locale, market, FPUsername, FPPassword){

	//old skyscanner_url
	//var skyscanner_url = "http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/"+market+"/"+currency+"/"+locale+"/"+codeDep+"/"+codeArr+"/"+departureDate+"/"+returnDate+"?apiKey="+apiKey;

	//Fareportal implementation
	//Create Authorization header
	const nativeB64 = new base64({ useNative: true });
	var svcCredentials = nativeB64.encode(FPUsername + ":" + FPPassword);

	try{
		var res = HTTP.call('POST', urlAPIStructure, 
			{
				headers:{
					"Authorization": "Basic " + svcCredentials,
					"Content-Type": "application/json"
				}, 
				data:{
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
							"DepartureDate": departureDate,
							"DepartureTime": "0100",
							"Destination": codeDep,
							"Origin": codeArr
							},
							{
							"DepartureDate": returnDate,
							"DepartureTime": "0100",
							"Destination": codeArr,
							"Origin": codeDep
							}
						]
					}
				}
		});
		return res;
	}
	catch(e){
		console.log(e);
	}
    
};