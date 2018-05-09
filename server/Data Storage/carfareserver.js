var dateCarRefresh = 5;


Meteor.methods({

	'getCarFaresInCollection': function(ca, depDate, retDate, currency, locale, market){
		
		var dateNow = new Date();
		var dateThreshold = new Date();
		dateThreshold.setDate(dateNow.getDate()-dateCarRefresh);
		var cfs = {};
		var res = CarFares.findOne({pickUp : ca, departureDate : depDate, returnDate : retDate});

		// S'il y a une correspondance et que la mise à jour a eu lieu récemment
		if(res && res.dateUpdate >= dateThreshold && res.carFare.cars.length>1){
			//Just retrieve the field
			cfs = res;
		}
		else if(res && res.dateUpdate < dateThreshold){
			//Remove the field and Retrieve
			Meteor.call("updateCarFares", ca, depDate, retDate, currency, true, locale, market, function(err, result){
				if(!err){
					cfs = { pickUp : ca, departureDate : depDate, returnDate : retDate, dateUpdate : dateNow, carFare : result };
				}
			});
			console.log("alert car to be refreshed");
		}
		else{
			//Enter the missing search in the table and retrieve the result
			Meteor.call("updateCarFares", ca, depDate, retDate, currency, false, locale, market, function(err, result){
				if(!err){
					cfs = { pickUp : ca, departureDate : depDate, returnDate : retDate, dateUpdate : dateNow, carFare : result };
				}
				else{
					console.log(err);
				}
			});
			console.log("alert car no entry");
		}

		return cfs;
	},

	'getIP': function () {
		return this.connection.clientAddress;
	}
});
