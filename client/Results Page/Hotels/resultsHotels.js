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
		return ret;
	},

	getIDDiased: function(data){
		var res = "#"+data.hotels_prices.id+'ohotels'
		return res;
	},

	getIdNotDiased : function(data){
		return data.hotels_prices.id+'ohotels';
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		return cur2.Symbol;
	},
	getAgentImage: function(Agid){
		var res = Session.get("selectedLiveHotels");
		var imUrl="";
		console.log(res);
		_.forEach(res[0].agents, function(ag){
			if(ag.id==Agid){
				imUrl = ag.image_url;
			}
		});
		console.log(imUrl)
		return imUrl
	},
	getFirstImage : function(hotel){
		return hotel.newImages[0].url;
	},
})