AutoSuggest = new Mongo.Collection("autoSuggest");

Meteor.methods({
	'insertAutoSuggest': function(doc){
		var res = AutoSuggest.findOne({PlaceId: doc.PlaceId});

		if(res && res.CityId != ""){	
		}
		else{
			AutoSuggest.insert(doc);
		}
	},

  'flushAllSuggests': function(){
    AutoSuggest.remove({});
  },

});
