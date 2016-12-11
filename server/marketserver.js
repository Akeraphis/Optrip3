var apiKey = "cl675979726025908356913469447815";

Meteor.methods({
	'retrieveMarkets' : function(){
		var locale = "en-GB";
		var url = "http://partners.api.skyscanner.net/apiservices/reference/v1.0/countries/"+locale+"?apiKey="+apiKey;

		var response = HTTP.call("GET", url);
		console.log(response)

		_.forEach(response.data.Countries, function(res){
			Markets.insert(res);
		});

		return response;

	}
})
