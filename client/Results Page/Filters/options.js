Template.options.helpers({
	hasCar : function(){
		if(Session.get("cheapestLiveCar")){
			return true
		}
		else{
			return false
		}
	},
})