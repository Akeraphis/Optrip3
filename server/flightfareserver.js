var dateFlightRefresh = 5;

getFlightFaresInCollection = function(codeDep, codeArr, departureDate, returnDate, currency, locale, market, FPUsername, FPPassword){

	var dateNow = new Date();
	var dateThreshold = new Date();
	dateThreshold.setDate(dateNow.getDate()-dateFlightRefresh);
	var ffs = [];

	//For all the possible traversed cities
	_.forEach(codeDep, function(cd1){
		_.forEach(codeArr, function(ca1){
			_.forEach(ca1.code, function(ca2){
				var ca = ca2.code;
				var cd = cd1.code;

				console.log("retrieve from base, flight from : ", cd, " to ", ca);

				var res = FlightFares.findOne({departureCode : cd, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate});

				// S'il y a une correspondance et que la mise à jour a eu lieu récemment
				if(res && res.dateUpdate >= dateThreshold ){
					//Just retrieve the field
					ffs.push(res);

				}
				else if(res && res.dateUpdate < dateThreshold){
					//Remove the field and Retrieve
					var ff = getFlightFares(cd, ca, departureDate, returnDate, currency, locale, market, FPUsername, FPPassword);
					var result = FlightFares.update({ departureCode : cd, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate}, {dateUpdate : dateNow, flightFare : ff });
					ffs.push({ departureCode : cd, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, dateUpdate : dateNow, flightFare : ff });
					console.log("alert flight to be refreshed");

				}
				else{
					//Enter the missing search in the table and retrieve the result
					var ff = getFlightFares(cd, ca, departureDate, returnDate, currency, locale, market, FPUsername, FPPassword);
					var result = FlightFares.insert({ departureCode : cd, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, dateUpdate : dateNow, flightFare : ff });
					ffs.push({ departureCode : cd, arrivalCode : ca, departureDate : departureDate, returnDate : returnDate, dateUpdate : dateNow, flightFare : ff });
					console.log("alert flight no entry");
				}
			});
		});
	});

	return ffs;
};