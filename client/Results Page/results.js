
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
			return res[1][0].price_all_days;
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
	},

	carrierInbound : function(){
		var res = Session.get("results");
		var comp = "";

		if(res.length>1){
			var carrierCode = (((res[0])[2]).InboundLeg.CarrierIds)[0];
			var Carriers = (res[0])[4];

			_.forEach(Carriers, function(cid){
				if(cid.CarrierId == carrierCode){
					comp = cid.Name
				}
			});
		}
		return comp;
	},

	carrierOutbound : function(){
		var res = Session.get("results");
		var comp = "";

		if(res.length>1){
			var carrierCode = (((res[0])[2]).OutboundLeg.CarrierIds)[0];
			var Carriers = (res[0])[4];

			_.forEach(Carriers, function(cid){
				if(cid.CarrierId == carrierCode){
					comp = cid.Name
				}
			});
		}
		return comp;
	},

	orginOutboundAirport : function(){
		var res = Session.get("results");
		var orout = "";

		if(res.length>1){

			var originCode = ((res[0])[2]).OutboundLeg.OriginId;
			var Places = (res[0])[3];

			_.forEach(Places, function(pl){
				if(pl.PlaceId == originCode){
					orout = pl.Name
				}
			});
		}
		return orout;
	},

	orginInboundAirport : function(){
		var res = Session.get("results");
		var orout = "";

		if(res.length>1){
			var originCode = ((res[0])[2]).InboundLeg.OriginId;
			var Places = (res[0])[3];

			_.forEach(Places, function(pl){
				if(pl.PlaceId == originCode){
					orout = pl.Name
				}
			});
		}
		return orout;
	},

	destinationOutboundAirport : function(){
		var res = Session.get("results");
		var orout = "";

		if(res.length>1){
			var originCode = ((res[0])[2]).OutboundLeg.DestinationId;
			var Places = (res[0])[3];

			_.forEach(Places, function(pl){
				if(pl.PlaceId == originCode){
					orout = pl.Name
				}
			});
		}
		return orout;
	},

	destinationInboundAirport : function(){
		var res = Session.get("results");
		var orout = "";

		if(res.length>1){
			var originCode = ((res[0])[2]).InboundLeg.DestinationId;
			var Places = (res[0])[3];

			_.forEach(Places, function(pl){
				if(pl.PlaceId == originCode){
					orout = pl.Name
				}
			});
		}
		return orout;
	},
});

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
			unlim = res[1][0].value_add.included_mileage_unlimited;
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
});

Template.minHotel.helpers({
	minHotels : function(){
		var res = Session.get("results");
		if(res.length >1){
			return res[2][1];
		}
	},
});