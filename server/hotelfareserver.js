var apiKey = "prtl6749387986743898559646983194";
var market = "FR";
var rooms = 1;
var dateHotelRefresh = 1;

getHotelAutoSuggest = function(ipCity, currency, locale){

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

getHotelFares = function(sessionKey){

	var res = {};

	if(sessionKey){
		var url2 = "http://partners.api.skyscanner.net"+sessionKey;
		try{
			res = HTTP.call('GET', url2);
		}
		catch(e){
			console.log(e);
		}
	}

	return res;
};

getHotelSessionKey = function(entityid, checkindate, checkoutdate, currency, nbPerson, nbChildren, nbInfants, locale){

	var url = "http://partners.api.skyscanner.net/apiservices/hotels/liveprices/v2/" + market +"/" +  currency + "/" + locale + "/" + entityid + "/" + checkindate + "/" + checkoutdate + "/" + nbPerson + "/" + rooms + "?apiKey=" + apiKey;
	var res = {};

	try{
		var result1 = HTTP.call('GET',url);
	}
	catch(e){
		console.log(e);
	}

	var sessionKey = result1.headers.location;
	Meteor._sleepForMs(3000);

	return sessionKey;
};


getHotelFaresInCollection = function(departureDate, returnDate, ipa, currency,nbPerson, nbChildren, nbInfants, locale){

	var dateNow = new Date();
	var dateThreshold = new Date();
	dateThreshold.setDate(dateNow.getDate()-dateHotelRefresh);
	var hfs = {};
	var ipcity = ipa.ip.city;
	var ipcode = getHotelAutoSuggest(ipcity, currency, locale);

	var res = HotelFares.findOne({city : ipcity, checkin : departureDate, checkout : returnDate});

	// S'il y a une correspondance et que la mise à jour a eu lieu récemment
	if(res && res.dateUpdate >= dateThreshold && res.hotelFare != null){
		//Just retrieve the field
		hfs = res;

	}
	else if(res && res.dateUpdate < dateThreshold){
		//Remove the field and Retrieve
		var sessionKey = getHotelSessionKey(ipcode, departureDate, returnDate, currency, nbPerson, nbChildren, nbInfants, locale);
		var hf = getHotelFares(sessionKey);

		var result = HotelFares.update({city : ipcity, checkin : departureDate, checkout : returnDate}, {dateUpdate : dateNow, hotelFare : hf.data.hotels_prices, agents : hf.data.agents});
		hfs = { city : ipcity, checkin : departureDate, checkout : returnDate, dateUpdate : dateNow, hotelFare : hf.hotels_prices, agents : hf.data.agents};
		console.log("alert hotel fare to be refreshed");

	}
	else{
		//Enter the missing search in the table and retrieve the result
		var sessionKey = getHotelSessionKey(ipcode, departureDate, returnDate, currency, nbPerson, nbChildren, nbInfants, locale);
		var hf = getHotelFares(sessionKey);

		_.forEach(hf.data.hotels_prices, function(hp){
			getHotelsInCollection(sessionKey, hp.id);
		});

		var result = HotelFares.insert({ city : ipcity, checkin : departureDate, checkout : returnDate, dateUpdate : dateNow, hotelFare : hf.data.hotels_prices, agents : hf.data.agents});
		hfs = { city : ipcity, checkin : departureDate, checkout : returnDate, dateUpdate : dateNow, hotelFare : hf.hotels_prices , agents : hf.data.agents};
		console.log("alert hotel fare no entry");
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

/*Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth()+1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),'-', mm,'-', dd].join(''); // padding
};*/

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),'-',
          (mm>9 ? '' : '0') + mm,'-',
          (dd>9 ? '' : '0') + dd
         ].join('');
};
