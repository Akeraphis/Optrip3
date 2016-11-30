var apiKey = "prtl6749387986743898559646983194";
var market = "FR";
var locale = "en-GB";
var rooms = 1;
var dateHotelRefresh = 1;

getHotelAutoSuggest = function(ipCity, currency){

	var query = ipCity;
	var url = "http://partners.api.skyscanner.net/apiservices/hotels/autosuggest/v2/"+market+"/"+currency+"/"+locale+"/"+query+"?apikey="+apiKey;
	
	try{
		var res = HTTP.call('GET',url);
	}
	catch(e){
		console.log(e);
	}

	//Grosse aproximation pour le moment, renvoi le premier choix
	if(res.data.results[0]){
		return res.data.results[0].individual_id
	}

};

getHotelFares = function(entityid, checkindate, checkoutdate, currency, nbPerson){

	var url = "http://partners.api.skyscanner.net/apiservices/hotels/liveprices/v2/" + market +"/" +  currency + "/" + locale + "/" + entityid + "/" + checkindate + "/" + checkoutdate + "/" + nbPerson + "/" + rooms + "?apiKey=" + apiKey;

	try{
		var result1 = HTTP.call('GET',url);
	}
	catch(e){
		console.log(e);
	}

	var sessionKey = result1.headers.location;
	Meteor._sleepForMs(3000);

	if(sessionKey){
		var url2 = "http://partners.api.skyscanner.net"+sessionKey;
		try{
			var res = HTTP.call('GET', url2);
		}
		catch(e){
			console.log(e);
		}
	}
};

getHotelDetails = function(entityid, checkindate, checkoutdate, currency, nbPerson){
	var url = "http://partners.api.skyscanner.net/apiservices/hotels/liveprices/v2/" + market +"/" +  currency + "/" + locale + "/" + entityid + "/" + checkindate + "/" + checkoutdate + "/" + nbPerson + "/" + rooms + "?apiKey=" + apiKey;

	try{
		var result1 = HTTP.call('GET',url);
	}
	catch(e){
		console.log(e);
	}

	var sessionKey = result1.headers.location;
	Meteor._sleepForMs(5000);

	if(sessionKey){
		var url2 = "http://partners.api.skyscanner.net/apiservices/hotels/livedetails/v2/details/"+sessionKey+"&hotelIds="+hotelIds;
		try{
			var res = HTTP.call('GET', url2);
		}
		catch(e){
			console.log(e);
		}
	}
};

getHotelFaresInCollection = function(departureDate, returnDate, ipa, currency,nbPerson){

	var dateNow = new Date();
	var dateThreshold = new Date();
	dateThreshold.setDate(dateNow.getDate()-dateHotelRefresh);
	var hfs = {};
	var ipcity = ipa.ip.city;
	var ipcode = getHotelAutoSuggest(ipcity, currency);

	var res = HotelFares.findOne({city : ipcity, checkin : departureDate, checkout : returnDate});

	// S'il y a une correspondance et que la mise à jour a eu lieu récemment
	if(res && res.dateUpdate >= dateThreshold && res.hotelFare != null){
		//Just retrieve the field
		hfs = res;

	}
	else if(res && res.dateUpdate < dateThreshold){
			//Remove the field and Retrieve
		var hf = getHotelFares(ipcode, departureDate, returnDate, currency, nbPerson);
		//var newHotels = {address : hf.hotels.address, amenities : hf.hotels.amenities, distance_from_search : hf.hotels.distance_from_search, district : hf.hotels.district, hotel_id : hf.hotels.hotel_id, latitude : hf.hotels.latitude, longitude : hf.hotels.longitude, name : hf.hotels.name, number_of_rooms : hf.hotels.number_of_rooms, popularity : hf.hotels.popularity, popularity_desc : hf.hotels.popularity_desc, score : hf.hotels.score, star_rating : hf.hotels.star_rating, tag : hf.hotels.tag, types : hf.hotels.types}
		var newhf = {agents : hf.agents, amenities : hf.amenities, hotels : hf.hotels, hotels_prices : hf.hotels_prices, places : hf.places, total_available_hotels : hf.total_available_hotels, total_hotels : hf.total_hotels};
		var result = HotelFares.update({city : ipcity, checkin : departureDate, checkout : returnDate}, {dateUpdate : dateNow, hotelFare : newhf });
		hfs = { city : ipcity, checkin : departureDate, checkout : returnDate, dateUpdate : dateNow, hotelFare : newhf };
		console.log("alert hotel to be refreshed");

	}
	else{
		//Enter the missing search in the table and retrieve the result
		var hf = getHotelFares(ipcode, departureDate, returnDate, currency, nbPerson);
		//var newHotels = {address : hf.hotels.address, amenities : hf.hotels.amenities, distance_from_search : hf.hotels.distance_from_search, district : hf.hotels.district, hotel_id : hf.hotels.hotel_id, latitude : hf.hotels.latitude, longitude : hf.hotels.longitude, name : hf.hotels.name, number_of_rooms : hf.hotels.number_of_rooms, popularity : hf.hotels.popularity, popularity_desc : hf.hotels.popularity_desc, score : hf.hotels.score, star_rating : hf.hotels.star_rating, tag : hf.hotels.tag, types : hf.hotels.types}
		var newhf = {agents : hf.agents, amenities : hf.amenities, hotels : hf.hotels, hotels_prices : hf.hotels_prices, places : hf.places, total_available_hotels : hf.total_available_hotels, total_hotels : hf.total_hotels};
		var result = HotelFares.insert({ city : ipcity, checkin : departureDate, checkout : returnDate, dateUpdate : dateNow, hotelFare : newhf });
		hfs = { city : ipcity, checkin : departureDate, checkout : returnDate, dateUpdate : dateNow, hotelFare : newhf };
		console.log("alert hotel no entry");
	}

	return hfs;

};


makeDate = function(dateString){

	var year = dateString.substring(0, getPosition(dateString, "-", 1));
	var month = dateString.substring(5, getPosition(dateString, "-", 2));
	var day = dateString.substring(getPosition(dateString, "-", 2)+1, 10);

	var newMonth = (parseInt(month) - 1).toString();

	res = new Date(year, newMonth, day);
	return res
};

getPosition = function(str, m, i) {
   return str.split(m, i).join(m).length;
};

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth()+1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),'-', mm,'-', dd].join(''); // padding
};