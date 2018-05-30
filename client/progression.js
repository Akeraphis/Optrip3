Template.progression.helpers({
	'getProgress' : function(){
		Meteor.subscribe("progIp", Session.get("clientIp"));
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
		Meteor.subscribe("progIp", Session.get("clientIp"));
		return ProgressionUsers.findOne({ user : Session.get("clientIp")}).nbFlights;
	},
	'getNumberOfCars': function(){
		Meteor.subscribe("progIp", Session.get("clientIp"));
		return ProgressionUsers.findOne({ user : Session.get("clientIp")}).nbCars;
	},
	'getNumberOfHotels': function(){
		Meteor.subscribe("progIp", Session.get("clientIp"));
		return ProgressionUsers.findOne({ user : Session.get("clientIp")}).nbHotels;
	}
});
