//Global Variables
var clientId="97dead12-a592-4d38-b96e-af1992d932a0";
var clientSecret = "178cdea5-ea2d-46db-8555-98882d8b035e";

//Request a token
Meteor.methods({
	'getToken' : function(){
		var url = "https://ws.homeaway.com/oauth/token";

		var token = HTTP.call('POST', url, { auth : clientId+":"+clientSecret});
		return token.data.access_token
	},
	'searchHomeAway' : function(city, arrivalDate, leaveDate, currency, nbPerson, nbChildren, nbInfants, locale, market){
		var url = "https://ws.homeaway.com/public/search";
		var que = "Sienna";
		var token = Meteor.call('getToken');
		var search = HTTP.call('GET', url, {
			headers : {
				Authorization : "Bearer " + token
			},
			query : {
				q: que,
				//minSleeps : nbPerson,
				//availabilityStart : "2017-05-16",
				//availabilityEnd : "2017-05-19",
				//sort : "prices"
			}
		});
		return search
	},
	/*'getListingDetails' : function(optimalTrip, departureDate, returnDate, currency, nbPerson, nbChildren, nbInfants, locale, market){
		var url = "https://ws.homeaway.com/public/listing";
		var token = Meteor.call('getToken');
		var quote = HTTP.call('GET', url, {
			headers : {
				Authorization : "Bearer " + token
			},
			query : {
				adultsCounts: nbPerson,
				unitId :,
				departureDate : departureDate,
				listingId : ,
				currencyCode : currency,
				arrivalDate :, 
				childrenCount : nbChildren
			}
		});
	},*/
})