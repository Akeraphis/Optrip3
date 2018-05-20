Template.displayAllCars.helpers({
	allCars : function(){
		if(Session.get("selectedLiveCars")){
			filterCars();
			return Session.get("selectedLiveCars");
		}
	},
	symbolCurrency : function(){
		var cur = Session.get("selectedCurrency");
		var cur2 = Currencies.findOne({Code : cur});
		return cur2.Symbol;
	},
});

Template.displayAllCars.events({
	'click .btn-success' : function(e){
		Session.set("selectedCar", this);
		FlowRouter.go('/optimization/results');
	},
	'click .btn-default': function(e){
		FlowRouter.go('/optimization/results');
	}
});