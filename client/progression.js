Template.progression.helpers({
	'getProgress' : function(){
		var prog = ProgressionUsers.findOne({ user : Session.get("clientIp")});
		Session.set("progress", prog.progress);
		return Session.get("progress")
	},
	'getOperation' : function(){
		return ProgressionUsers.findOne({ user : Session.get("clientIp")}).operation;
	},
})