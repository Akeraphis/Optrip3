//var apiKey = "cl675979726025908356913469447815";
var apiKey = "prtl6749387986743898559646983194";
var dateCarRefresh = 5;

Meteor.methods({

})



Meteor.methods({

	'updateCarFares': function(codeArr, depDate, retDate, currency, alreadyExists, locale, market){

		var pickupdatetime = depDate + "T10:00";
		var dropoffdatetime = retDate + "T18:00";
		var userip = Meteor.call('getIP');
		var driverage = 30;
		var res = {};
		var dateNow = new Date();

		var url = "http://partners.api.skyscanner.net/apiservices/carhire/liveprices/v2/"+market+"/"+currency+"/"+locale+"/"+codeArr+"/"+codeArr+"/"+pickupdatetime+"/"+dropoffdatetime+"/"+driverage+"?apiKey="+apiKey+"&userip="+userip
		
		try{
			var result1 = HTTP.call('GET',url);
		}
		catch(e){
			console.log(e);
		}

		var temp = result1.headers.location;
		var sessionKey = temp.substring(0, temp.search("deltaExcludeWebsites"));
		Meteor._sleepForMs(5000);

		if(sessionKey){
			var url2 = "http://partners.api.skyscanner.net"+sessionKey+"?apiKey="+apiKey;
			HTTP.call('GET', url2, function(error, result){
				res = result.data;

				if(!error){
					if (alreadyExists){
						CarFares.update({ pickUp : codeArr, departureDate : depDate, returnDate : retDate}, {dateUpdate : dateNow, carFare : res });
					}
					else{
						CarFares.insert({ pickUp : codeArr, departureDate : depDate, returnDate : retDate, dateUpdate : dateNow, carFare : res });
					}
				}
				else{
					console.log(error);
				}
			});
		}

	    return res;
	},

	/*'importCarFaresFinished' : function(res){
		var bool = true;

		console.log(res.websites);

		_.forEach(res.websites, function(wb){
			if(wb.in_progress){
				bool = false;
			}
		});

		return bool;

	},*/

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
	},

	'getHttpHeader' : function(){
		return this.connection.httpHeaders;
	}
});
