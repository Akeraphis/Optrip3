var apiKey = "cl675979726025908356913469447815";

Meteor.methods({
	'retrieveLocales' : function(){
		var url = "http://partners.api.skyscanner.net/apiservices/reference/v1.0/locales?apiKey="+apiKey;

		var response = HTTP.call("GET", url);

		console.log(response.data.Locales);

		_.forEach(response.data.Locales, function(res){
			Locales.insert(res);
		});

		return response;

	}
})
