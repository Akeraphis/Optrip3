Template.minHotel.helpers({
	minHotels : function(){
		return Session.get("cheapestLiveHotels");
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		//return cur2.Symbol;
		return "€";
	},
});

Template.minHotel.events({
	'click .btn-info': function(e){
		FlowRouter.go('/optimization/results/hotels/'+this.location.city+'/'+this.checkin+'/'+this.checkout);
	}
});

Template.displayHotel.helpers({
	getDistanceFromCenter: function(lat, lng){
		var d = distance(lat, lng, Template.parentData(3).location.lat, Template.parentData(3).location.lng);
		return Math.round(d*100)/100;
	}
});