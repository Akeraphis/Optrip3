Meteor.methods({
	findOptimalTrip: function(codeArr, optimalCircuit, departureDate, returnDate, flightTable, currency, nbPerson, nbChildren, nbInfants, locale, market){
		
		//for each possible arrival airport take, the cheapest flight
		//find the optimal circuit for the selected airport
		//get the cheapest price of the trip
		var cheapestFlightHotelAndCarPrice = Infinity;
		var cheapestQuote = [];
		var minCar = [];
		var newIpDays = [];

		// 1. Retrieve possible flight arrival places
		_.forEach(flightTable, function(ft){

			var res = {};

			var res = Meteor.call("getCheapestFlight", ft);

			console.log("1 -----> For the city of " + res[1].ip.city + ", for "+ nbPerson +" persons, the flight price is :" + res[0]*nbPerson);
		
			if(res[0] < Infinity){

				//2. For staying from 1 to n-1 days in ip1
				var ac = res[1];
				var nbDays1 = ac.nbDays;
				var CodeArrOrderedLeft = Meteor.call("getCodeArrOrderLeft", ac, optimalCircuit);
				var CodeArrOrderedRight = Meteor.call("getCodeArrOrderReverse", ac, CodeArrOrderedLeft);

				for (var i=1; i<nbDays1; i++){

					//3. Retrieve the min Car price
					
					var pickUpDate = makeDate(departureDate);
					pickUpDate.setDate(makeDate(departureDate).getDate() + i);
					var dropOffDate = makeDate(returnDate);
					dropOffDate.setDate(makeDate(returnDate).getDate() - nbDays1 + i);

					pickUp = pickUpDate.yyyymmdd();
					dropOff = dropOffDate.yyyymmdd();

					var carCode = getHotelAutoSuggest(ac.ip.city, currency, locale, market);
					var minQuoteCar = {};
					var minPriceCar = Infinity;

					var result = Meteor.call("getCarFaresInCollection", carCode, pickUp, dropOff, currency, locale, market);

					_.forEach(result.carFare.cars, function(quote){
						if(quote.price_all_days < minPriceCar){
						minPriceCar = quote.price_all_days;
						minQuoteCar = quote;
						}
					});

					minCar = [minQuoteCar, result.carFare.websites, result.carFare.car_classes, result.carTypes, result];

					console.log("2 -----> For the city of " + res[1].ip.city + ", leaving after " + i + " days, the car location price is :" + minPriceCar);
					
					if(minPriceCar<Infinity){

						var res3 = Meteor.call("getCheapestHotel", ac, pickUp, CodeArrOrderedLeft, CodeArrOrderedRight, departureDate, returnDate, dropOff, currency, nbPerson, nbChildren, nbInfants, locale, market);

						console.log("3 -----> Leaving after " + i + " days, the hotel best possible combination price is :" + res3[0]);

						if(res[0]*nbPerson+minPriceCar+res3[0] < cheapestFlightHotelAndCarPrice){
							cheapestFlightHotelAndCarPrice = res[0]*nbPerson+minPriceCar+res3[0];
							cheapestQuote = [res, minCar,res3];
							newIpDays = Meteor.call("getNewIpDays", res3[2], i, ac);

							console.log("4. So the cheapest option to leave from:" + res[1].ip.city + " amounts to : ", res[0]*2+minPriceCar+res3[0]);
							
						}
					}
				}
			}
		});

		console.log("----------------   OPTIMIZED PRICE : " + cheapestFlightHotelAndCarPrice + "---------------------");
		return [cheapestFlightHotelAndCarPrice, cheapestQuote, optimalCircuit, newIpDays];
	},

	updateFares : function(codeArr, optimalCircuit, departureDate, returnDate, flightTable, currency, nbPerson, nbChildren, nbInfants, locale, market){

		// 1. Retrieve possible flight arrival places
		_.forEach(flightTable, function(ft){

			//2. For staying from 1 to n-1 days in ip1
			var ac = ft.arrivalCode;
			var nbDays1 = ac.nbDays;
			var CodeArrOrderedLeft = Meteor.call("getCodeArrOrderLeft", ac, optimalCircuit);
			var CodeArrOrderedRight = Meteor.call("getCodeArrOrderReverse", ac, CodeArrOrderedLeft);

			for (var i=1; i<nbDays1; i++){

				//3. Retrieve the min Car price
				
				var pickUpDate = makeDate(departureDate);
				pickUpDate.setDate(makeDate(departureDate).getDate() + i);
				var dropOffDate = makeDate(returnDate);
				dropOffDate.setDate(makeDate(returnDate).getDate() - nbDays1 + i);

				pickUp = pickUpDate.yyyymmdd();
				dropOff = dropOffDate.yyyymmdd();

				var carCode = getHotelAutoSuggest(ac.ip.city, currency, locale, market);


				Meteor.call("getCarFaresInCollection", carCode, pickUp, dropOff, currency, locale, market, function(err,result){
					if(!err){
						console.log("---- Step 5 completed : Hotel Fares retrieved ----");
					}
					else{
						console.log(err);
					}
				});

				Meteor.call("getCheapestHotel", ac, pickUp, CodeArrOrderedLeft, CodeArrOrderedRight, departureDate, returnDate, dropOff, currency, nbPerson, nbChildren, nbInfants, locale, market, function(err, result){
					if(!err){
						console.log("---- Step 6 completed : Car Fares retrieved ----");
					}
					else{
						console.log(err);
					}
				});
			}
		});
	},

	getCheapestFlight: function(ft){

		var minPrice = Infinity;
		var minQuote = {};
		var minInboundPrice = Infinity;
		var minOutboundPrice = Infinity;
		var minInboundQuote = {};
		var minOutboundQuote = {};
		var minPriceTwoLegs = Infinity;
		var minQuoteTwoLegs = {};

		_.forEach(ft.flightFare.Quotes, function(quote){
			if(quote.MinPrice > 0 && quote.MinPrice < minPriceTwoLegs && quote.InboundLeg && quote.OutboundLeg){
				minPriceTwoLegs = quote.MinPrice;
				minQuoteTwoLegs = quote;
			}
			if(quote.MinPrice > 0 && quote.MinPrice < minInboundPrice && quote.InboundLeg && !quote.OutboundLeg){
				minInboundPrice = quote.MinPrice;
				minInboundQuote = quote;
			}
			if(quote.MinPrice > 0 && quote.MinPrice < minInboundPrice && !quote.InboundLeg && quote.OutboundLeg){
				minOutboundPrice = quote.MinPrice;
				minOutboundQuote = quote;
			}
		});

		var arrId = "";

		if(minPriceTwoLegs<=minInboundPrice+minOutboundPrice){
			minPrice = minPriceTwoLegs;
			minQuote = minQuoteTwoLegs;
			arrId = minQuote.DestinationId;
		}
		else{
			minPrice = minInboundPrice+minOutboundPrice;
			minQuote = {Minprice : minPrice, InboundDirect : minInboundQuote.Direct, OutboundDirect: minOutboundQuote.Direct, OutboundLeg : minOutboundQuote.OutboundLeg, InboundLeg : minInboundQuote.InboundLeg};
			arrId = minOutboundQuote.DestinationId;
		}

		var arrName = "";

		_.forEach(ft.flightFare.Places, function(p){
			if (p.PlaceId == arrId){
				arrName = p.Name;
			}
		});
	
		return [minPrice, ft.arrivalCode, minQuote, ft.flightFare.Places, ft.flightFare.Carriers]
	},

	getCheapestHotel : function(codeArr, pickUp, leftCircuit, rightCircuit, departureDate, returnDate, dropOff, currency, nbPerson, nbChildren, nbInfants, locale, market){

		var countDays = 0;

		//Run Hotel Fare for left Circuit
		var resLeft = Meteor.call("getCircuitCheapestPrice", leftCircuit, pickUp, countDays, currency, nbPerson, nbChildren, nbInfants, locale, market);

		//Run Hotel Fare for right Circuit
		var resRight = Meteor.call("getCircuitCheapestPrice", rightCircuit, pickUp, countDays, currency, nbPerson, nbChildren, nbInfants, locale, market);

		//Add the cost of the hotel for the starting ip beginning and end of the trip
		var firstLastRes = Meteor.call("getCheapestHotelFirstLastIP", codeArr, departureDate, pickUp, returnDate, dropOff, currency, nbPerson, nbChildren, nbInfants, locale, market);

		var resHotelQuote = [];
		var resHotelMinPrice = 0;
		var circuit = [];

		//take the minimum of the options
		if (resLeft[0] < resRight[0]){
			resHotelMinPrice = resLeft[0] + firstLastRes[0] + firstLastRes[2];
			resHotelQuote.push(firstLastRes[1]);

			_.forEach(resLeft[1], function(mql){
				resHotelQuote.push(mql);
			});

			resHotelQuote.push(firstLastRes[3]);
			circuit = leftCircuit;
		}
		else{
			resHotelMinPrice = resRight[0] + firstLastRes[0] + firstLastRes[2];
			resHotelQuote.push(firstLastRes[1]);

			_.forEach(resRight[1], function(mqr){
				resHotelQuote.push(mqr);
			});

			resHotelQuote.push(firstLastRes[3]);
			circuit = rightCircuit;
		}

		return [resHotelMinPrice, resHotelQuote, circuit];
	},

	getCodeArrOrderLeft : function(codeArr, optimalCircuit){

		var i=0;
		var newCircuit = [];

		//look for position of startup Ip in the optimalCircuit
		var len = optimalCircuit.length
		_.forEach(optimalCircuit, function(ipDays){

			if(ipDays.ip.city == codeArr.ip.city){

				for (var k=0; k < len; k++){
					if (k+i < len){
						newCircuit[k] = optimalCircuit[k+i];
					}
					else{
						newCircuit[k] = optimalCircuit[len-1-k];
					}
				}
			}

			i++;
		});

		return newCircuit
	},

	getCodeArrOrderReverse : function(codeArr, optimalCircuit){

		var i=0;
		var newCircuit = [];

		//look for position of startup Ip in the optimalCircuit
		var len = optimalCircuit.length

		newCircuit[0] = optimalCircuit[0];

		for (var k=1; k < len; k++){
				newCircuit[k] = optimalCircuit[len-k];
		}			

		return newCircuit
	},

	getCircuitCheapestPrice : function(Circuit, pickUpDate, countDays, currency, nbPerson, nbChildren, nbInfants, locale, market){

		var minPrice = Infinity;
		var total_min_price = 0;
		var minQuotes = [];
		var minQuote = {};
		var minHotelQuotes = {};
		var i=0;

		_.forEach(Circuit, function(arr){

			if(i>=1){
				var startDate = makeDate(pickUpDate);
				startDate.setDate(makeDate(pickUpDate).getDate() + countDays);
				var endDate = makeDate(pickUpDate);
				endDate.setDate(makeDate(pickUpDate).getDate() + countDays + arr.nbDays);

				var start = startDate.yyyymmdd();
				var end = endDate.yyyymmdd();
				var ht = {};
				var ag = {};


				var resHotel = getHotelFaresInCollection(start, end, arr, currency, nbPerson, nbChildren, nbInfants, locale, market);

				_.forEach(resHotel.hotelFare, function(hf){
					_.forEach(hf.agent_prices, function(ap){
						if(ap.price_total < minPrice){
							minPrice = ap.price_total;
							minQuote = {id : ap.id, price_total : ap.price_total};
							ht = Hotels.findOne({hotel_id : hf.id});
							ag = Meteor.call("getAgent", resHotel.agents, ap.id);
						}
					});
				});

				minHotelQuotes = {minQuote: minQuote, city: resHotel.city, checkin: resHotel.checkin, checkout: resHotel.checkout, hotel : ht, agent : ag}//, agents: resHotel.hotelFare.agents, amenities: resHotel.hotelFare.amenities, hotels: resHotel.hotelFare.hotels, places: resHotel.hotelFare.places, total_available_hotels: resHotel.hotelFare.total_available_hotels, total_hotels: resHotel.hotelFare.total_hotels};
				countDays = countDays + arr.nbDays;
				minQuotes.push(minHotelQuotes);
				total_min_price = total_min_price + minPrice;
				minPrice = Infinity;
			}

			i++;
		});

		return [total_min_price, minQuotes];
	},

	getCheapestHotelFirstLastIP : function(arr, departureDate, pickUp, returnDate, dropOff, currency, nbPerson, nbChildren, nbInfants, locale, market){

		var firstresHotel = getHotelFaresInCollection(departureDate, pickUp, arr, currency, nbPerson, nbChildren, nbInfants, locale, market);
		var lastresHotel = getHotelFaresInCollection(dropOff, returnDate, arr, currency, nbPerson, nbChildren, nbInfants, locale, market);

		var minFirstQuote = {};
		var minFirstPrice = Infinity;
		var minLastQuote = {};
		var minLastPrice = Infinity;
		minFirstHotelQuotes = [];
		minLastHotelQuotes = [];
		var firstht = {};
		var lastht = {};
		var firstag = {};
		var lastag = {};

		_.forEach(firstresHotel.hotelFare, function(hf){
			_.forEach(hf.agent_prices, function(ap){
				if(ap.price_total < minFirstPrice){
					minFirstPrice = ap.price_total;
					minFirstQuote = {id : ap.id, price_total : ap.price_total};
					firstht = Hotels.findOne({hotel_id : hf.id});
					firstag = Meteor.call("getAgent", firstresHotel.agents, ap.id);
				}
			});
		});

		_.forEach(lastresHotel.hotelFare, function(hf){
			_.forEach(hf.agent_prices, function(ap){
				if(ap.price_total < minLastPrice){
					minLastPrice = ap.price_total;
					minLastQuote = {id : ap.id, price_total : ap.price_total};
					lastht = Hotels.findOne({hotel_id : hf.id});
					lastag = Meteor.call("getAgent", lastresHotel.agents, ap.id);
				}
			});
		});

		minFirstHotelQuotes = {minQuote: minFirstQuote, city: firstresHotel.city, checkin: firstresHotel.checkin, checkout: firstresHotel.checkout, hotel : firstht, agent : firstag}//, agents: firstresHotel.hotelFare.agents, amenities: firstresHotel.hotelFare.amenities, hotels: firstresHotel.hotelFare.hotels, places: firstresHotel.hotelFare.places, total_available_hotels: firstresHotel.hotelFare.total_available_hotels, total_hotels: firstresHotel.hotelFare.total_hotels};
		minLastHotelQuotes = {minQuote: minLastQuote, city: lastresHotel.city, checkin: lastresHotel.checkin, checkout: lastresHotel.checkout, hotel : lastht, agent : lastag}//, agents: lastresHotel.hotelFare.agents,amenities: lastresHotel.hotelFare.amenities,hotels: lastresHotel.hotelFare.hotels,places: lastresHotel.hotelFare.places,total_available_hotels: lastresHotel.hotelFare.total_available_hotels,total_hotels: lastresHotel.hotelFare.total_hotels};
			

		return [minFirstPrice, minFirstHotelQuotes, minLastPrice, minLastHotelQuotes];
	},

	getAgent : function(agents, id){

		var res = [];

		_.forEach(agents, function(ag){
			if(ag.id == id){
				res=ag;
			}
		});

		return res;
	},

	getNewIpDays : function(circuit, i, ac){
		var newIpDays = [];
		var k=0;

		_.forEach(circuit, function(ipDays){
			if(k==0){
				console.log("Pisa :", i);
				newIpDays.push({ip : ipDays.ip, nbDays : i, step : "start"});
			}
			else{
				newIpDays.push({ip : ipDays.ip, nbDays : ipDays.nbDays, step :"inter"});
			}
			k++;
		});

		newIpDays.push({ip : circuit[0].ip, nbDays : circuit[0].nbDays-i, step : "end"});

		return newIpDays;
	}

});

Array.prototype.move = function (from, to) {
	this.splice(to, 0, this.splice(from, 1)[0]);
};