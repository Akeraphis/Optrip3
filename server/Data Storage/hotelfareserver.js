var rooms = 1;
var dateHotelRefresh = 5;

getHotelFaresInCollection = function(departureDate, returnDate, ipa, currency,nbPerson, nbChildren, nbInfants, locale, market){

	var dateNow = new Date();
	var dateThreshold = new Date();
	dateThreshold.setDate(dateNow.getDate()-dateHotelRefresh);
	var hfs = {};
	var ipcity = ipa.ip.city;
	var ipcode = getHotelAutoSuggest(ipcity, currency, locale, market);

	var res = HotelFares.findOne({city : ipcity, checkin : departureDate, checkout : returnDate});

	// S'il y a une correspondance et que la mise à jour a eu lieu récemment
	if(res && res.dateUpdate >= dateThreshold && res.hotelFare != null){
		//Just retrieve the field
		hfs = res;

	}
	else if(res && res.dateUpdate < dateThreshold){
		//Remove the field and Retrieve
		var sessionKey = getHotelFares(ipcode, departureDate, returnDate, currency, nbPerson, nbChildren, nbInfants, locale, market);
		var hf = getHotelFares(sessionKey);

		var result = HotelFares.update({city : ipcity, checkin : departureDate, checkout : returnDate}, {dateUpdate : dateNow, hotelFare : hf.data.hotels_prices, agents : hf.data.agents});
		hfs = { city : ipcity, checkin : departureDate, checkout : returnDate, dateUpdate : dateNow, hotelFare : hf.hotels_prices, agents : hf.data.agents};
		console.log("alert hotel fare to be refreshed");

	}
	else{
		//Enter the missing search in the table and retrieve the result
		var sessionKey = getHotelFares(ipcode, departureDate, returnDate, currency, nbPerson, nbChildren, nbInfants, locale, market);
		var hf = getHotelFares(sessionKey);

		/*_.forEach(hf.data.hotels_prices, function(hp){
			getHotelsInCollection(sessionKey, hp.id);
		});*/

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

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),'-',
          (mm>9 ? '' : '0') + mm,'-',
          (dd>9 ? '' : '0') + dd
         ].join('');
};
