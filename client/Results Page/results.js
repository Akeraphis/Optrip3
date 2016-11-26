
Template.relaunch.events({
	'click .relaunch': function(e){

		Meteor.call("updateIpDays", Session.get('selectedIp'), Session.get('nbDays'), function(error, result){
			if (error){
				console.log(error.reason);
			}
			else{
				//send this information to the server to optimize and return result
				Meteor.call('optimizeTrip', Session.get("departureFrom"), Session.get("departureDate"), result, Session.get('selectedCurrency'), Session.get('nbPersons'), function(error, res){
					if(error){
						alert("This is an error while optimizing the trip!");
					}
					else{
						console.log(res);
					}
				});

			}
		});
	}
});