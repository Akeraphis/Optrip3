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
			var hd2 = formatHotelDetails(hd);

			res.push(hd2);
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

formatHotelDetails = function(hd){

	_.forEach(hd.data.hotels, function(hot){
		hot.newAmenities=[];
		_.forEach(hot.amenities, function(am){
			_.forEach(hd.data.amenities, function(ameni){
				if(ameni.id==am){
					hot.newAmenities.push(ameni);
				}
			});
		});
		_.forEach(hd.data.places, function(pl){
			if(pl.id==hot.district){
				hot.place=pl;
			}
		});
	});

	_.forEach(hd.data.hotels_prices, function(hp){
		_.forEach(hp.agent_prices, function(ap){
			_.forEach(hd.data.agents, function(ag){
				if(ap.id==ag.id){
					ap.agent=ag;
				}
			});
		});
	});

	_.forEach(hd.data.hotels, function(hot){
		var str = JSON.stringify(hot.images);
		var pc ="";
		var im = [];
		var url = hd.data.image_host_url;
		var res = "";
		for(i=0; i<str.length; i++){
			var c = str.charAt(i);
			if(c=="/" && pc=="\""){
				res=str.substring(i, str.indexOf("/", i+1)+1);
				var newSub = str.substring(i, str.length);
				var n = newSub.search("order");
				var k = newSub.search("],\"mt.jpg\"");
				var order = newSub.substring(n+8,k);
				im.push({url : "http://"+url+res+"mc.jpg", order : order});
			}
			pc=c;
		}
		hot.newImages = orderImages(im);
	});
	

	return hd;
};

orderImages = function(images){
	images.sort(function(a,b){
		if(a.order>b.order){
			return 1;
		}
		if(a.order<b.order){
			return -1;
		}
		else{
			return 0;
		}
	});

	return images
}