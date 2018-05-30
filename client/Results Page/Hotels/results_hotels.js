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
	},
	getImageFromHD: function(property_code){
		var handle = Meteor.subscribe("hotelDetailsByCode", property_code);
		if(handle.ready()){
			var hd = HotelDetails.findOne({property_code: property_code});
			if(hd){
				return hd.pictures[0];
			}
			else{
				return "https://use.fontawesome.com/releases/v5.0.13/svgs/solid/home.svg"
			}
			
		}
	},
	getStarsFromHD: function(property_code){
		var handle = Meteor.subscribe("hotelDetailsByCode", property_code);
		if(handle.ready()){
			var hd = HotelDetails.findOne({property_code: property_code});
			if(hd){
				var stars = hd.stars;
				var res=[];
				for(var i=0;i<stars;i++){
					res.push(stars[i]);
				} 
				return res;
			}
			else{
				return[]
			}
		}
	},
	getRatingFromHD: function(property_code){
		var handle = Meteor.subscribe("hotelDetailsByCode", property_code);
		if(handle.ready()){
			var hd = HotelDetails.findOne({property_code: property_code});
			if(hd){
				return hd.grade_tripadvisor;
			}
			else{
				return "unknown";
			}
			
		}
	},
});