var maxHotelDetails = 5;

Meteor.methods({
	getHotelsLivePrices : function(optimalTrip, departureDate, returnDate, currency, nbPerson, nbChildren, nbInfants, locale, market){

		var res = [];

		_.forEach(optimalTrip, function(op){
			var city = getHotelAutoSuggest(op.city, currency, locale, market);
			var sessionKey = getHotelSessionKey(city, op.checkin, op.checkout, currency, nbPerson, nbChildren, nbInfants, locale, market);
			var hf = getHotelFares(sessionKey);
			var hotelIds = getCheapestHotelIds(hf, maxHotelDetails);
			var detailsUrl = hf.data.urls.hotel_details;
			var hd = getHotelsDetails2(detailsUrl, idsToString(hotelIds));

			res.push(hd);
		})

		return res;
	},


});

getCheapestHotelIds = function(hf, maxHotelDetails){
	var res = [];
	_.forEach(hf.data.hotels, function(h){
		res.push(h.hotel_id);
	});

	return res;//.substring(0, res.length-1);
};