var apiKey = "prtl6749387986743898559646983194";
var market = "FR";
var locale = "en-GB";
var rooms = 1;
var dateHotelRefresh = 1;


getHotelDetails = function(sessionKey, hotelIds){
	var res = {};

	if(sessionKey){
		var url2 = "http://partners.api.skyscanner.net/apiservices/hotels/livedetails/v2/details/"+sessionKey+"&hotelIds="+hotelIds;
		try{
			res = HTTP.call('GET', url2);
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
		var result = Hotels.insert(hot);
		hfs = hot;
		console.log("alert hotel details no entry");
	}

	return hfs;

};