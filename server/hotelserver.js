var apiKey = "prtl6749387986743898559646983194";
var market = "FR";
var locale = "en-GB";
var rooms = 1;
var dateHotelRefresh = 1;


getHotelsDetails2 = function(url, hotelsIds){
	var res = {};

	var url2 = "http://partners.api.skyscanner.net"+url+"&hotelIds="+hotelsIds;
	//var url3 = "http://partners.api.skyscanner.net/apiservices/hotels/livedetails/v2/polldetails/"+sessionKey+"&hotelIds="+hotelIds;
	try{
		res = HTTP.call('GET', url2);
		//HTTP.call('GET', url3);
	}
	catch(e){
		console.log(e);
	}

	return res;
};

getHotelsInCollection = function(detailsUrl, hotelIds){
	var hids = []
	var hfs = [];

	_.forEach(hotelIds, function(hid){
		
		var res = Hotels.findOne({hotel_id : hid});

		if(res){
			hfs.push(res);
		}
		else{
			//Enter the missing search in the table and retrieve the result
			hids.push(hid);
		}
	});


	var hot = getHotelDetails2(detailsUrl, idsToString(hids));

	_.forEach(hot.data.hotels, function(hotel){
		addHotelInCollection(hotel, hot.data.amenities);
	});

	hfs = Hotels.findOne({hotel_id : hotelid});

	return hfs;
};

idsToString = function(ids){
	var res =""
	_.forEach(ids, function(id){
		res = res + id +','
	});

	return res.substring(0, res.length-1);
}

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