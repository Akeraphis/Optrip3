CarFares = new Mongo.Collection("carFares");


Meteor.methods({
	'insertCarFares': function(doc){
    return CarFares.insert(doc);
	},

  'flushAllCarFares': function(){
    CarFares.remove({});
  },

});

