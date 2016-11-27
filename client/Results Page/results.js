
Template.relaunch.events({
	'click .relaunch': function(e){

		Pace.restart();
		Pace.start();

		console.log(Session.get("departureFrom"), Session.get("departureDate"), Session.get('selectedCurrency'), Session.get('nbPersons'), Session.get('selectedIp'), Session.get('nbDays'));

		Meteor.call("updateIpDays", Session.get('selectedIp'), Session.get('nbDays'), function(error, result){
			if (error){
				console.log(error.reason);
			}
			else{
				//send this information to the server to optimize and return result
				Meteor.call('optimizeTrip', Session.get("departureFrom"), Session.get("departureDate"), result, Session.get('selectedCurrency'), Session.get('nbPersons'), function(error, res){
					if(error){
						alert("This is an error while optimizing the trip!");
					}
					else{
						console.log(res);
						Session.set("minTotalPrice", res[0]);
						Session.set("results", res[1]);
						Pace.stop();
					}
				});

			}
		});
	}
});

Template.minPrice.helpers({

	results : function(){
		if (Session.get("minTotalPrice")<Infinity){
			return true;
		}
		else{
			return false;
		}
	},

	minTotalPrice : function(){

		return Session.get("minTotalPrice")

	},
	minCarPrice : function(){

		var res = Session.get("results");
		if(res.length >1){
			return res[1].price_all_days;
		}
	},
	minFlightPrice : function(){

		var res = Session.get("results");
		if(res.length >1){
			return ((res[0])[0]);
		}
	},
	minHotelPrices : function(){
		var res = Session.get("results");
		var hp = [];

		if(res.length >1){
			return (res[2])[0];
		}

	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});

		return cur2.Symbol;
	}
});

Template.minFlight.helpers({
	

	minFlightArrival : function(){
		var res = Session.get("results");
		if(res.length >1){
			return ((res[0])[1]).ip.city;
		}
	},

	minDepTime : function(){
		var res = Session.get("results");
		if(res.length >1){
			var res = Session.get("results");
			return ((res[0])[2]).OutboundLeg.departureDate;
		}
	},
	isDirect : function(){
		var res = Session.get("results");
		if (res.length >1){
			var res = Session.get("results");
			var direct = ((res[0])[2]).Direct;

			if(direct){
				return "Direct Flight";
			}
			else{
				return "Not direct";
			}
		}
	}
});

Template.minCar.helpers({

	minVehicle : function(){
		var res = Session.get("results");
		if(res.length >1){
			return res[1].vehicle;
		}
	},
});

Template.minHotel.helpers({

});