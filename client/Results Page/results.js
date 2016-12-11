var countProgress=0;
Template.relaunch.events({
	'click .optimizeButton': function(e){
		console.log(Session.get("departureFrom"), Session.get("departureDate"), Session.get('selectedCurrency'), Session.get('nbPersons'), Session.get('selectedIp'), Session.get('nbDays'), Session.get("nbChildren"), Session.get("nbInfants"), Session.get("selectedLocal"), Session.get("selectedMarket"));

		Meteor.call("updateIpDays", Session.get('selectedIp'), Session.get('nbDays'), function(error, result){
			if (error){
				console.log(error.reason);
			}
			else{
				Session.set("ipDays", result);
				console.log(Session.get("departureFrom"), Session.get("departureDate"), result, Session.get('selectedCurrency'), Session.get('nbPersons'), Session.get("nbChildren"), Session.get("nbInfants"), Session.get("selectedLocal"), Session.get("selectedMarket"));
				//send this information to the server to optimize and return result
				Meteor.call('optimizeTrip', Session.get("departureFrom"), Session.get("departureDate"), result, Session.get('selectedCurrency'), Session.get('nbPersons'), Session.get("nbChildren"), Session.get("nbInfants"), Session.get("selectedLocal"), Session.get("selectedMarket"), function(error, res){
					if(error){
						alert("This is an error while updating the fares!");
					}
					else{
						Session.set("results", res[0][1]);
						Session.set("minTotalPrice", res[0][0]);
						Session.set("optimalCircuit", res[0][2]);
						Session.set("newIpDays", res[0][3]);
						console.log(res);
						Session.set("totalResults", res);
					}
				});
			}
		});
	},

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
		var depDateTime = this.DepartureDateTime;
		return depDateTime.substring(0, depDateTime.indexOf("T"));
	},
	getDepTime: function(){
		var depDateTime = this.DepartureDateTime;
		return depDateTime.substring(depDateTime.indexOf("T")+1);
	},
	getArrDate: function(){
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

Template.tripDays.helpers({
	ipDays : function(){
		return Session.get("newIpDays");
	},
	getCityStep : function(){
		return this.ip.city+"/"+this.step;
	}
});

Template.tripDays.events({
	'click .form-control': function(e){
		var ses = Session.get("newIpDays");
		var res = [];

		_.forEach(Session.get("newIpDays"), function(ipDays){
			if(ipDays.ip.city == e.target.name.substring(0, e.target.name.indexOf("/")) && ipDays.step == e.target.name.substring(e.target.name.indexOf("/")+1)){
				res.push({ip : ipDays.ip, nbDays : e.target.value, step : ipDays.step})
			}
			else{
				res.push(ipDays);
			}
		});

		Session.set("newIpDays", res),
		console.log(Session.get("newIpDays"));
	},
	'click .popEvents': function(){
		console.log("Populating events")
		var event={id:1 , title: 'New event', start:  new Date()};

		$('#myCalendar').fullCalendar( 'renderEvent', event, true);
	}
});

Template.tripDays.onRendered(function(){
		var newIpDays = Session.get("newIpDays");
		var depDate = Session.get('departureDate');
		var countDays=0;

		_.forEach(Session.get("newIpDays"), function(ipDays){
			var startDate = moment(depDate).add(countDays, 'days');
			var endDate = moment(depDate).add(ipDays.nbDays + countDays,'days');
			var event ={title : ipDays.ip.city, start : startDate, end : endDate, color:'red'};
			$('#myCalendar').fullCalendar( 'renderEvent', event);
			countDays= countDays+ipDays.nbDays;
		});
		var endTrip = moment(depDate).add(countDays, 'days');
		var event2= {title : "trip", start : depDate, end: endTrip };

		$('#myCalendar').fullCalendar( 'renderEvent', event2, true);
		$('#myCalendar').fullCalendar( 'gotoDate', moment(depDate) )

});
/*
makeDate = function(dateString){

	var year = dateString.substring(0, getPosition(dateString, "-", 1));
	var month = dateString.substring(5, getPosition(dateString, "-", 2));
	var day = dateString.substring(getPosition(dateString, "-", 2)+1, 10);

	var newMonth = (parseInt(month) - 1).toString();

	res = new Date(year, newMonth, day);
	return res
};

getPosition = function(str, m, i) {
   return str.split(m, i).join(m).length;
};*/