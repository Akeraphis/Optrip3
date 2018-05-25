Template.progression.helpers({
	'getProgress' : function(){
		//Meteor.subscribe("progIp", Session.get("clientIp"));
		Meteor.subscribe("allProgressions")
		var prog = ProgressionUsers.findOne({ user : Session.get("clientIp")});
		if(prog){
			Session.set("progress", prog.progress);
			return Session.get("progress")
		}
	},
	'getOperation' : function(){
		if(ProgressionUsers.findOne({ user : Session.get("clientIp")})){
			return ProgressionUsers.findOne({ user : Session.get("clientIp")}).operation;
		}
	},
});

Template.feedbackSearch.helpers({
	'getNumberOfFlights': function(){
		Meteor.subscribe("allProgressions")
		var prog = ProgressionUsers.findOne({ user : Session.get("clientIp")});
		if(prog){
			Session.set("nbFlights", prog.nbFlights);
			return Session.get("nbFlights")
		}
	},
	'getNumberOfCars': function(){
		Meteor.subscribe("allProgressions")
		var prog = ProgressionUsers.findOne({ user : Session.get("clientIp")});
		if(prog){
			Session.set("nbCars", prog.nbCars);
			return Session.get("nbCars")
		}
	},
	'getNumberOfHotels': function(){
		Meteor.subscribe("allProgressions")
		var prog = ProgressionUsers.findOne({ user : Session.get("clientIp")});
		if(prog){
			Session.set("nbHotels", prog.nbHotels);
			return Session.get("nbHotels")
		}
	}
});
