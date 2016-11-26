var apiKey = "cl675979726025908356913469447815";
var market = "FR";
var locale = "en-GB";
var dateFlightRefresh = 1;

Meteor.methods({

	getPlaceAutosuggest : function(query, currency){
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

})

getFlightFares = function(codeDep, codeArr, departureDate, returnDate, currency){

	var ff = [];

		var url = "http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/"+market+"/"+currency+"/"+locale+"/"+codeDep+"/"+codeArr+"/"+departureDate+"/"+returnDate+"?apiKey="+apiKey;

		try{
			var res = HTTP.call('GET',url);
		}
		catch(e){
			console.log(e);
		}

    return res;
};

getFlightFaresInCollection = function(codeDep, codeArr, departureDate, returnDate, currency){

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
			var ff = getFlightFares(codeDep, ca.code, departureDate, returnDate, currency);
			var result = FlightFares.update({ departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate}, {dateUpdate : dateNow, flightFare : ff });
			ffs.push({ departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, dateUpdate : dateNow, flightFare : ff });
			console.log("alert flight 1");

		}
		else{
			//Enter the missing search in the table and retrieve the result
			var ff = getFlightFares(codeDep, ca.code, departureDate, returnDate, currency);
			var result = FlightFares.insert({ departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, dateUpdate : dateNow, flightFare : ff });
			ffs.push({ departureCode : codeDep, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, dateUpdate : dateNow, flightFare : ff });
			console.log("alert flight 2");
		}
	});

	return ffs;
};