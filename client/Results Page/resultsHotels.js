Template.displayAllHotels.helpers({
	allHotels : function(dat){
		var res = Session.get("selectedLiveHotels");
		var ret = {};
		_.forEach(res, function(lh){	
			_.forEach(lh.data.hotels_prices, function(hp){
				if(hp.id==dat.hotels_prices.id){
					ret = lh.data;
				}
			});
		});
		console.log(ret);
		return ret.hotels_prices;
	},

	getIDDiased: function(data){
		return "#"+data..id;
	},

	getIdNotDiased : function(data){
		return data.id;
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		return cur2.Symbol;
	},
})