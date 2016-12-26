//Global Variables
var clientId="97dead12-a592-4d38-b96e-af1992d932a0";
var clientSecret = "178cdea5-ea2d-46db-8555-98882d8b035e";

//Request a token
Meteor.methods({
	'getToken' : function(){
		var url = "https://ws.homeaway.com/oauth/token";
		var token ={};

		HTTP.call('POST', url, { auth : clientId+":"+clientSecret}, function(err, res){
			if(err){
				console.log(err);
			}
			else{
				token = res
			}
		});

		return token
	}
})