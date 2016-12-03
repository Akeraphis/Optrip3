var apiKey = "prtl6749387986743898559646983194";
var market = "FR";
var locale = "en-GB";
var rooms = 1;
var dateHotelRefresh = 1;


getHotelDetails = function(sessionKey, hotelIds){
	var res = {};

	if(sessionKey){
		var url2 = "http://partners.api.skyscanner.net"+sessionKey+"&hotelIds="+hotelIds;
		//var url3 = "http://partners.api.skyscanner.net/apiservices/hotels/livedetails/v2/polldetails/"+sessionKey+"&hotelIds="+hotelIds;
		try{
			res = HTTP.call('GET', url2);
			//HTTP.call('GET', url3);
		}
		catch(e){
			console.log(e);
		}
	}

	return res;
};

getHotelsInCollection = function(sessionKey, hotelid){

	var hfs = {};
	var res = Hotels.findOne({hotel_id : hotelid});

	if(res){
		hfs = res;
	}
	else{
		//Enter the missing search in the table and retrieve the result
		var hot = getHotelDetails(sessionKey, hotelid);

		_.forEach(hot.data.hotels, function(hotel){
			addHotelInCollection(hotel, hot.data.amenities);
		});

		hfs = Hotels.findOne({hotel_id : hotelid});;
		console.log("alert hotel details no entry");
	}

	return hfs;

};

addHotelInCollection = function(input, amenities){

	var am = [];

	_.forEach(input.amenities, function(amen){
		_.forEach(amenities, function(amenity){
			if(amen == amenity.id){
				am.push({name : amenity.name});
			}
		});
	});

	var hotel = {name : input.name, hotel_id : input.hotel_id, address : input.address, popularity : input.popularity, popularity_desc : input.popularity_desc, latitude : input.latitude, longitude : input.longitude, star_rating : input.star_rating, distance_from_search : input.distance_from_search, tag : input.tag, score: input.score, amenities : am};
	Hotels.insert(hotel);
};