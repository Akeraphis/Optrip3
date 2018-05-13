Template.minCar.helpers({

	minVehicle : function(){
		return Session.get("cheapestLiveCar");
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		//return cur2.Symbol;
		return "€";
	}
});