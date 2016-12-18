Template.displayAllCars.helpers({
	allCars : function(){
		var slc = filterCars();
		return slc;
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		return cur2.Symbol;
	},
	getCarImage : function(image_id){
		var res = Session.get("selectedLiveCars").carFare.images;
		var imUrl = "";

		_.forEach(res, function(im){
			if(im.id==image_id){
				imUrl = im.url;
			}
		});

		return imUrl;
	},
	getWebsiteImage : function(image_id){
		var res = Session.get("selectedLiveCars").carFare.websites;
		var imUrl = "";

		_.forEach(res, function(im){
			if(im.id==image_id){
				imUrl = im.image_url;
			}
		});

		return imUrl;
	}
});


Template.carAgents.helpers({
	allAgents : function(){
		return Session.get("selectedLiveCars").carFare.websites;
	},
});

Template.carAgents.events({
	'click .carAgentGroup' : function(e){
		filterCars();
	}
})

filterCars = function(){
	var maxNumber = 30;
	var slc = Session.get("selectedLiveCars").carFare.cars;
	var maxCarPrice= Infinity;
	var res = [];

	_.forEach(slc, function(car){
		if (sanitycheckAgent(car.website_id, getSelectedAgents())){}
		else if(car.price_all_days<maxCarPrice){
			res.push(car);
			res.sort(function(a,b){
				if(a.price_all_days>b.price_all_days){
					return 1;
				}
				if(a.price_all_days<b.price_all_days){
					return -1;
				}
				else{
					return 0;
				}
			});

			if(res.length>maxNumber){
				res.splice(maxNumber, 1);
			}
			maxCarPrice = res[res.length-1].price_all_days;
		}
	});
	return res;
}

getSelectedAgents = function(){
	var agents = document.getElementsByName("agentSelected");
	var res = [];

	_.forEach(agents, function(ag){
		if(ag.checked==true){
			res.push(ag.id);
		}
	});

	console.log(res);
	return res;
};

sanitycheckAgent = function(agId, agents){
	var res = true;

	_.forEach(agents, function(ag){
		if(ag==agId){
			res = false;
		}
	});

	return res
};