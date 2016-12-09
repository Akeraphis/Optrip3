var countProgress=0;
Template.relaunch.events({
	'click .optimizeButton': function(e){
		console.log(Session.get("departureFrom"), Session.get("departureDate"), Session.get('selectedCurrency'), Session.get('nbPersons'), Session.get('selectedIp'), Session.get('nbDays'), Session.get("nbChildren"), Session.get("nbInfants"), Session.get("selectedLocal"), Session.get("selectedMarket"));

		Meteor.call("updateIpDays", Session.get('selectedIp'), Session.get('nbDays'), function(error, result){
			if (error){
				console.log(error.reason);
			}
			else{
				//send this information to the server to optimize and return result
				Meteor.call('optimizeTrip', Session.get("departureFrom"), Session.get("departureDate"), result, Session.get('selectedCurrency'), Session.get('nbPersons'), Session.get("nbChildren"), Session.get("nbInfants"), Session.get("selectedLocal"), Session.get("selectedMarket"), function(error, res){
					if(error){
						alert("This is an error while optimizing the trip!");
					}
					else{
						console.log(res);
						Session.set("minTotalPrice", res[0][0]);
						Session.set("results", res[0][1]);
						Session.set("optimalCircuit", res[0][2]);
						Session.set("totalResults", res);
						drawRoute(GoogleMaps.maps.map.instance, Session.get("optimalCircuit"));
					}
				});

			}
		});
	}
});

Template.minFlight.events({
	'click #myTabs a': function(e){
		e.preventDefault()
  		$(this).tab('show')
	}
})

Template.results.helpers({
	results : function(){
		if (Session.get("minTotalPrice")<Infinity){
			return true;
		}
		else{
			return false;
		}
	}
});

Template.minPrice.helpers({

	minTotalPrice : function(){
		var res = Session.get("results");
		if(res.length >1){
			return Math.round(res[1][0].price_all_days+(Session.get("totalResults"))[2]+(res[2])[0]);
		}
	},

	minCarPrice : function(){
		var res = Session.get("results");
		if(res.length >1){
			return Math.round(res[1][0].price_all_days);
		}
	},

	minFlightPrice : function(){
		var res = Session.get("totalResults");
		if(res.length >1){
			return Math.round(res[2]*Session.get('nbPersons'));
		}
	},

	minHotelPrices : function(){
		var res = Session.get("results");
		var hp = [];
		if(res.length >1){
			return Math.round((res[2])[0]);
		}
	},

	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		return cur2.Symbol;
	},

	nbPersons : function(){
		return Session.get('nbPersons');
	},
});

Template.minFlight.helpers({

	minLiveFlight : function(){
		var res = Session.get("totalResults");
		if(res[1].Currencies.length >=1){
			return res[1];
		}
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		return cur2.Symbol;
	}
});

Template.leg.helpers({
	getDepDate: function(){
		console.log(this);
		var depDateTime = this.DepartureDateTime;
		return depDateTime.substring(0, depDateTime.indexOf("T"));
	},
	getDepTime: function(){
		var depDateTime = this.DepartureDateTime;
		return depDateTime.substring(depDateTime.indexOf("T")+1);
	},
	getArrDate: function(){
		console.log(this);
		var depDateTime = this.ArrivalDateTime;
		return depDateTime.substring(0, depDateTime.indexOf("T"));
	},
	getArrTime: function(){
		var depDateTime = this.ArrivalDateTime;
		return depDateTime.substring(depDateTime.indexOf("T")+1);
	}
})

Template.minCar.helpers({

	minVehicle : function(){
		var res = Session.get("results");
		if(res.length >1){
			return res[1][0].vehicle;
		}
	},
	minDoors : function(){
		var res = Session.get("results");
		if(res.length >1){
			return res[1][0].doors;
		}
	},
	minManual : function(){
		var res = Session.get("results");
		var manual = false ;
		if(res.length >1){
			manual =res[1][0].manual;
		}
		if(manual){
			return "Manual";
			}
		else{
			return "Not manual";
		}
	},
	minSeats : function(){
		var res = Session.get("results");
		if(res.length >1){
			return res[1][0].seats;
		}
	},
	minFuel : function(){
		var res = Session.get("results");
		if(res.length >1){
			return res[1][0].value_add.fuel.policy;
		}
	},
	minUnlimitedMileage : function(){
		var res = Session.get("results");
		var unlim = false;
		if(res.length >1){
			unlim = res[1][0].value_add.included_mileage.unlimited;
		}
		if(unlim){
			return "Unlimited Mileage";
			}
		else{
			return "Limited Mileage";
		}
	},

	minWebsiteName : function(){
		var res = Session.get("results");
		var web = "";

		if(res.length>1){
			var webid = res[1][0].website_id;
			var Websites = (res[1])[1];

			_.forEach(Websites, function(wb){
				if(wb.id == webid){
					web = wb.name;
				}
			});
		}
		return web;
	},
	minWebsiteImage : function(){
		var res = Session.get("results");
		var webim = "";

		if(res.length>1){
			var webid = res[1][0].website_id;
			var Websites = (res[1])[1];

			_.forEach(Websites, function(wb){
				if(wb.id == webid){
					webim = wb.image_url;
				}
			});
		}
		return webim;
	},
	minCarClass : function(){
		var res = Session.get("results");
		var cc = "";

		if(res.length>1){
			var ccid = res[1][0].car_class_id;
			var Classes = (res[1])[2];

			_.forEach(Classes, function(cl){
				if(cl.id == ccid){
					cc = cl.name;
				}
			});
		}
		return cc;
	},

	minCarPrice : function(){
		var res = Session.get("results");
		if(res.length >1){
			return Math.round(res[1][0].price_all_days);
		}
	},

	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		return cur2.Symbol;
	}
});

Template.minHotel.helpers({
	minHotels : function(){
		var res = Session.get("results");
		if(res.length >1){
			return res[2][1];
		}
	},

	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		return cur2.Symbol;
	}
});