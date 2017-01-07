AutoSuggest = new Mongo.Collection("autoSuggest");

Meteor.methods({
	'insertAutoSuggest': function(doc){
		var res = AutoSuggest.findOne({value: doc.value});

		if(res && res.value != ""){	
		}
		else{
			AutoSuggest.insert(doc);
		}
	},

  'flushAllSuggests': function(){
    AutoSuggest.remove({});
  },

});
