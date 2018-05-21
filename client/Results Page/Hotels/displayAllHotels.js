Template.displayAllHotels.events({
	'click .btn-default': function(e){
		FlowRouter.go('/optimization/results');
	},
	'click .btn-success' : function(e){
		var res = Session.get("cheapestLiveHotels");
		var res2 = this;
		var city = FlowRouter.getParam('city');
		var checkin = FlowRouter.getParam('checkin');
		var checkout = FlowRouter.getParam('checkout');
		_.forEach(res, function(lh){
			if(lh.checkout == checkout && lh.checkin== checkin && lh.location.city == city){
				lh.hotelFare.results = res2;
				Session.set("cheapestLiveHotels", res);
				FlowRouter.go('/optimization/results');
			}
		});
	}
});

Template.displayAllHotels.helpers({
	allHotels : function(dat){
		var res = Session.get("selectedLiveHotels");
		var city = FlowRouter.getParam('city');
		var checkin = FlowRouter.getParam('checkin');
		var checkout = FlowRouter.getParam('checkout');
		var res2={};
		_.forEach(res, function(lh){
			if(lh.checkout == checkout && lh.checkin== checkin && lh.location.city == city){
				res2 = lh;
			}
		});
		return res2.hotelFare.results;
	},
});

Template.displayHotels.helpers({
	getDistanceFromCenter: function(lat, lng){
		var city = FlowRouter.getParam('city');
		var ips = Session.get("newIpDays");
		var lat2 = 0;
		var lng2 = 0;

		_.forEach(ips, function(ip){
			if(ip.ip.city==city){
				lat2= ip.ip.lat;
				lng2=ip.ip.lng;
			}
		});
		var d = distance(lat, lng, lat2, lng2);
		return Math.round(d*100)/100;
	},
	getCity: function(){
		return FlowRouter.getParam('city');
	}
})