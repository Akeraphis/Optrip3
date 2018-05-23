Template.distanceFromCenter.onRendered(function(){

	var dur = getMinMaxDistance();

	var $range = $("#distanceCenter");

	$range.ionRangeSlider({
	    type: "double",
	    grid: false,
	    min: 0,
	    max: dur[1],
	    from: 0,
	    to: dur[1],
	    step: 0.2,
	    postfix: "kms",
	    onFinish: function (data) {
			filterHotels();
		},
	});
});


getMinMaxDistance = function(){
	var min = Infinity;
	var max = 0;

	var res = Session.get("selectedLiveHotels");
	var city = FlowRouter.getParam('city');
	var checkin = FlowRouter.getParam('checkin');
	var checkout = FlowRouter.getParam('checkout');

	_.forEach(res, function(lh){
		if(lh.checkout == checkout && lh.checkin== checkin && lh.location.city == city){
			_.forEach(lh.hotelFare.results, function(res2){
				var d = distanceFromCenter(res2.location.latitude, res2.location.longitude);
				if(d<min){
					min = d;
				}
				else if(d>max){
					max = d;
				}
			});
		}
	});

	return [Math.round(min),Math.round(max)];
};

filterHotels = function(){
	var res = Session.get("allLiveHotels");
	var city = FlowRouter.getParam('city');
	var checkin = FlowRouter.getParam('checkin');
	var checkout = FlowRouter.getParam('checkout');
	var minDistance = $("#distanceCenter").data("ionRangeSlider").result.from;
	var maxDistance = $("#distanceCenter").data("ionRangeSlider").result.to;
	var resHotel = [];

	_.forEach(res, function(lh){
		if(lh.checkout == checkout && lh.checkin== checkin && lh.location.city == city){
			var temp = [];
			var temp2 = lh;
			_.forEach(lh.hotelFare.results, function(res2){
				var d = distanceFromCenter(res2.location.latitude, res2.location.longitude);
				if(d<minDistance || d>maxDistance){}
				else {
					temp.push(res2);
				}
			});
			temp.sort(function(a,b){
				if(parseInt(a.total_price.amount)>parseInt(b.total_price.amount)){
					return 1;
				}
				if(parseInt(a.total_price.amount)<parseInt(b.total_price.amount)){
					return -1;
				}
				else{
					return 0;
				}
			});
			temp2.hotelFare.results = temp;
			resHotel.push(temp2);
		}
		else{
			resHotel.push(lh);
		}
	});

	Session.set("selectedLiveHotels", resHotel);
}