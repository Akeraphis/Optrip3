var urlAPIStructure = "https://api-dev.fareportallabs.com/air/api/search/searchflightavailability";
import { base64 } from 'meteor/ostrio:base64';

getHotelFares = function(ipcode, departureDate, returnDate, currency, nbPerson, nbChildren, nbInfants, locale, market){

	var res = {};

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
					"SearchKey": null,
					"PortalId": 104,
					"CheckIn": departureDate,
					"CheckOut": returnDate,
					"LocationId": 0,
					"AirportCityCode": null,
					"RoomsToSearch": [
						{
							"NumberOfChildren": nbChildren,
							"NumberOfAdults": nbPerson,
							"NumberOfSeniors": 0
						}
					],
					"FpAffiliateCode": null,
					"FpSubAffiliateCode": null,
					"TokenId": "d13ff544-6dad-4021-b97f-0258ac2295aa",
					"SearchFrom": 0,
					"TotalNoOfAdults": 0,
					"TotalNoOfChildren": 0,
					"ClientIpAddress": null,
					"LocationSearchCriteria": {
						"LocationID": 27346,
						"AirportCityCode": "LAS",
						"DestinationId": null
					}
				}
		});
		return res;
	}
	catch(e){
		console.log(e);
	}

	return res;
};