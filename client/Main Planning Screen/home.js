Session.set("selectedCurrency", "EUR");
Session.set('nbPersons', 2);
Session.set('departureFrom',"");
Session.set('departureDate', "");
Session.set('nbDays', []);
Session.set("minTotalPrice", Infinity);

Template.home.helpers({
	settings: function() {
		return {
			position: Session.get("position"),
			limit: 10,
			rules: [
				{
				// token: '',
					collection: AutoSuggest,
					field: 'PlaceName',
					matchAll: true,
					template: Template.displayDeparture
				}
			]
		};
	}
});

Template.selectedIPs.helpers({
	selectedIp : function(){
		return Session.get("selectedIp");
	}
});

Template.home.events({

	//-------------------------------------------------------------------------------------------------
	// Function called when the user clicks on the optimize button
	//-------------------------------------------------------------------------------------------------
	'submit .startingPanel' : function(e){

		// prevent reset of the form
		e.preventDefault();

		//create all variables to get values in the form
		var departureFrom = document.getElementById("departurePoint");
		var departureDate = document.getElementById("departureDate");
		var nbDaysElements = document.getElementsByClassName('NbDays');
		var nbPersons = document.getElementById("NbPerson");
		var nbDays = [];

		Session.set("nbPersons", nbPersons.value);
		Session.set("departureDate", departureDate.value);
		Session.set("departureFrom", departureFrom.value);



		for (var i=0; i<nbDaysElements.length; i++){
			nbDays.push(nbDaysElements[i].value);
		}

		Session.set('nbDays', nbDays);
		var totalDays = 0;

		Router.go('/optimization/results');

		//Call the update method for selectedIPDays
		Meteor.call("updateIpDays", Session.get('selectedIp'), Session.get('nbDays'), function(error, result){
			if (error){
				console.log(error.reason);
			}
			else{
				//send this information to the server to optimize and return result
				Meteor.call('optimizeTrip', Session.get("departureFrom"), Session.get("departureDate"), result, Session.get('selectedCurrency'), Session.get('nbPersons'), function(error, res){
					if(error){
						alert("This is an error while updating the fares!");
					}
					else{
						console.log(res);
						Session.set("minTotalPrice", res[0]);
					}
				});

			}
		});

		/*
		//Get the best circuit for the selected IPs
		Meteor.call("orderIps", interestPoints, function(err, result){
			if (err){
				console.log("error", err.reason);
			}
			else{
				Session.set("optimalCircuit", result);

				//draw the route
				//------------------------------------------------------------------------------------------------------------------------
				//drawCircuit(GoogleMaps.maps.map.instance, Session.get("optimalCircuit"));
				drawRoute(GoogleMaps.maps.map.instance, Session.get("optimalCircuit"));
				//------------------------------------------------------------------------------------------------------------------------
			}
		});*/
	},

	'keypress .form-control' : function(e){
		
		var departureFrom = document.getElementById("departurePoint");

		if(departureFrom.value.length >= 1){
			var depAutoSuggest = Meteor.call("getPlaceAutosuggest", departureFrom.value, "EUR", function(error, result){
			if(error){
				alert("There is no autocomplete suggested !");
			}
			else{
				//Delete all elements in collection	
				//Meteor.call("flushAllSuggests");

				//Refresh collection

				if(result.Places[0]){Meteor.call("insertAutoSuggest", result.Places[0]);}
				if(result.Places[1]){Meteor.call("insertAutoSuggest", result.Places[1]);}
				if(result.Places[2]){Meteor.call("insertAutoSuggest", result.Places[2]);}
				if(result.Places[3]){Meteor.call("insertAutoSuggest", result.Places[3]);}
				if(result.Places[4]){Meteor.call("insertAutoSuggest", result.Places[4]);}
				if(result.Places[5]){Meteor.call("insertAutoSuggest", result.Places[5]);}
				if(result.Places[6]){Meteor.call("insertAutoSuggest", result.Places[6]);}
				if(result.Places[7]){Meteor.call("insertAutoSuggest", result.Places[7]);}
				if(result.Places[8]){Meteor.call("insertAutoSuggest", result.Places[8]);}
			}

			});	
		}

	},

	//-------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------------------------
});

Template.currencies.helpers({

	Currencies: function(){
    	return Currencies.find().fetch();
	}
});

Template.currencies.events({
	"change #cur": function(e){
		var currency = $(e.currentTarget).val();
		Session.set("selectedCurrency", currency);
        console.log("currency : " + Session.get('selectedCurrency'));
	}
})
