Template.buy.events({
	'click .buyButton' : function(e){
		var car = Session.get("SelectedCar");
		console.log(car.deeplink_url);

		window.open(car.deeplink_url);

	}
})