var apiKey = "cl675979726025908356913469447815";

Meteor.methods({
	'retrieveCurrencies' : function(){
		var url = "http://partners.api.skyscanner.net/apiservices/reference/v1.0/currencies?apiKey="+apiKey;

		var response = HTTP.call("GET", url);

		_.forEach(response.data.Currencies, function(res){
			Currencies.insert(res);
		});

		return response;

	}
})
