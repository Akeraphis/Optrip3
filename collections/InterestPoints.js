InterestPoints = new Mongo.Collection("interestPoints");

Meteor.methods({
	'insertIP': function(doc){
		return InterestPoints.insert(doc);
	},
	'deleteIP': function(doc){
		return InterestPoints.remove(doc);
	},
	'editIP': function(doc, field, newField){
		if (field=="name"){
			return InterestPoints.update(doc, {$set:{"name": newField}});	
		}
		else if(field=="latitude"){
			return InterestPoints.update(doc, {$set:{"latitude": newField}});
		}
		else if(field=="longitude"){
			return InterestPoints.update(doc, {$set:{"longitude": newField}});
		}
	},
	//Vider la collection de villes
	'flushAllCities' : function(){
		InterestPoints.remove({});
	}
});	
