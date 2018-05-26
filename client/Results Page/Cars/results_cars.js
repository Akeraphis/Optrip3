Template.minCar.helpers({
	minVehicle : function(){
		return Session.get("selectedCar");
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		//return cur2.Symbol;
		return "€";
	}
});

Template.minCar.events({
	'click .btn-info': function(e){
		FlowRouter.go('/optimization/results/cars');
	},

	'click .car_trash': function(e){
		Session.set("selectedCar", null);
	}
});