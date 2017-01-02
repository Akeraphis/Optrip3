Template.progression.helpers({
	'getProgress' : function(){
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
})