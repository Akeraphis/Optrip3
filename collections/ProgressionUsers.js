ProgressionUsers = new Mongo.Collection("progressionUsers");

Meteor.methods({
	'insertProgressionUser': function(doc){
		return ProgressionUsers.insert(doc);
	},
	'deleteProgressionUser' : function(userip){
		ProgressionUsers.remove({user : userip});
	}
});	