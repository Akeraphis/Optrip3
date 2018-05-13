
Template.minHotel.helpers({
	minHotels : function(){
		var res = Session.get("selectedLiveHotels");
		return getMinHotels(res);
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		//return cur2.Symbol;
		return "€";
	}
});


getMinHotels = function(hf){

	var minHotels = [];
	_.forEach(hf, function(hff){
		var minhp = Infinity;
		var minHP = "";
		var minhotP = {};
		var temphf = hff;
		var minap = {};

		_.forEach(hff.hotelFare.results, function(hp){
			if(hp.total_price.amount < minhp){
				minhp = hp.total_price.amount;
				minHP = hp.property_code;
				minhotP = hp;
			}
		});

		temphf.hotelFare.results = minhotP;
		minHotels.push(temphf);

	});

	return minHotels
}