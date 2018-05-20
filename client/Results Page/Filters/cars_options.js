Template.carAgents.helpers({
	allAgents : function(){
		var allCars = Session.get("allLiveCars");
		var res=[];
		var prov = [];

		_.forEach(allCars, function(car){
			if(!containsId(car.provider.company_code, prov)){
				prov.push(car.provider.company_code);
				res.push(car.provider);
			}
		});
		return res;
	}
});

Template.carAgents.events({
	'click .carAgentGroup': function(){
		filterCars();
	}
});

filterCars = function(){
	var maxNumber = 30;
	var result = Session.get("allLiveCars");
	var maxCarPrice = Infinity;
	var res = [];
	var arr = Session.get("newIpDays")[0];
	var dist = 50;

	_.forEach(result, function(car){
		if(distance(car.location.latitude, car.location.longitude, arr.ip.lat, arr.ip.lng) > dist){}
		else if (sanitycheckAgent(car.provider.company_code, getSelectedAgents())){}
		else if(parseInt(car.cars.estimated_total.amount)<maxCarPrice){
			res.push(car);
			res.sort(function(a,b){
				if(parseInt(a.cars.estimated_total.amount)>parseInt(b.cars.estimated_total.amount)){
					return 1;
				}
				if(parseInt(a.cars.estimated_total.amount)<parseInt(b.cars.estimated_total.amount)){
					return -1;
				}
				else{
					return 0;
				}
			});

			if(res.length>maxNumber){
				res.splice(maxNumber, 1);
			}
			maxCarPrice = res[res.length-1].cars.estimated_total.amount;
		}
	});

	Session.set("selectedLiveCars", res);
}

getSelectedAgents = function(){
	var agents = document.getElementsByName("agentSelected");
	var res = [];

	_.forEach(agents, function(ag){
		if(ag.checked==true){
			res.push(ag.id);
		}
	});

	return res;
};

sanitycheckAgent = function(agId, agents){
	var res = true;

	_.forEach(agents, function(ag){
		if(ag==agId){
			res = false;
		}
	});
	if(agents.length == 0){
		res = false;
	}
	return res
};

distance = function(lat1, lon1, lat2, lon2) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	dist = dist * 1.609344;
	return dist
}
