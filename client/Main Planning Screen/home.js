Template.home.helpers({
	settings: function() {
		return {
			position: Session.get("position"),
			limit: 10,
			rules: [
				{
				// token: '',
					collection: AutoSuggest,
					field: 'label',
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
	},
	hasIp: function(){
		var res = true;
		if(Session.get("selectedIp").length>0){
			res=false;
		}
		return res;
	}
});


Template.home.events({

	//-------------------------------------------------------------------------------------------------
	// Function called when the user clicks on the optimize button
	//-------------------------------------------------------------------------------------------------
	'click .btn-secondary' : function(e){

		// prevent reset of the form
		e.preventDefault();

		//create all variables to get values in the form
		var departureFrom = document.getElementById("departurePoint");
		var departureDate = document.getElementById("departureDate");
		var nbDaysElements = document.getElementsByName('NbDays');
		var nbPersons = document.getElementById("NbPerson");
		var nbChildren = document.getElementById("NbChildren");
		var nbInfants = document.getElementById("NbInfants");
		var nbDays = [];
		var totalNbDays = 0;

		for (var i=0; i<nbDaysElements.length; i++){
			nbDays.push(nbDaysElements[i].value);
			totalNbDays += parseInt(nbDaysElements[i].value);
		}

		Session.set('nbDays', nbDays);

		var sc = sanityCheck(departureFrom.value, departureDate.value, Session.get('selectedIp'), totalNbDays, nbPersons.value, nbChildren.value, nbInfants.value);
		var passedSanityCheck = sc[0];
		var messageSC = sc[1];

		if(!passedSanityCheck){
			document.getElementById('myalert').innerHTML = messageSC;
			$("#mySCModal").modal('show');
		}
		else{
			Session.set("nbPersons", nbPersons.value);
			Session.set("nbChildren", nbChildren.value);
			Session.set("nbInfants", nbInfants.value);
			Session.set("departureDate", departureDate.value);
			Session.set("departureFrom", departureFrom.value);
			var totalDays = 0;

			//Go to proression bar screen and start counting
			Meteor.call("getIpAddress", function(err, res){
				if(!err){
					FlowRouter.go('/progression');
					Session.set("clientIp", res);
					Meteor.call('insertProgressionUser', {user : Session.get("clientIp"), progress : 0, operation : "Initializing"});
				}
			});

			//Call the update method for selectedIPDays
			Meteor.call("updateIpDays", Session.get('selectedIp'), Session.get('nbDays'), function(error, result){
				if (error){
					console.log(error.reason);
				}
				else{
					Session.set("ipDays", result);
					console.log(Session.get("departureFrom"), Session.get("departureDate"), result, Session.get('selectedCurrency'), Session.get('nbPersons'), Session.get("nbChildren"), Session.get("nbInfants"), Session.get("selectedLocal"), Session.get("selectedMarket"));

					//---- OPTIMIZE VIA AMADEUS
					Meteor.call('optimizeTripViaAmadeus', Session.get("departureFrom"), Session.get("departureDate"), result, Session.get('selectedCurrency'), Session.get('nbPersons'), Session.get("nbChildren"), Session.get("nbInfants"), Session.get("selectedLocal"), Session.get("selectedMarket"), function(err, res){
						if(!error){
							console.log(res);
							FlowRouter.go('/optimization/results');
							Meteor.call('deleteProgressionUser', Session.get("clientIp"));
							Session.set("selectedLiveFlights", res[4]);
							Session.set("allLiveFlights", res[4]);
							Session.set("selectedLiveCars", res[5]);
							Session.set("allLiveCars", res[5]);
							Session.set("cheapestLiveFlight", res[6][0]);
							Session.set("selectedFlightPrice", (res[6][0]).fare);
							Session.set("selectedItin", res[6][0].itineraries[0]);
							Session.set("cheapestLiveCar", res[6][1]);
							Session.set("selectedCar", res[6][1]);
							Session.set("allLiveHotels", res[7]);
							Session.set("selectedLiveHotels", res[7]);
							Session.set("cheapestLiveHotels", res[8]);
							Session.set("newIpDays", res[2]);
						}
					});
				}
			});
		}
	},


	'keypress .form-control' : function(e){
		
		var departureFrom = document.getElementById("departurePoint");

		if(departureFrom.value.length >= 1){
			var depAutoSuggest = Meteor.call("getPlaceAutosuggest", departureFrom.value, "EUR", "en-GB", "FR", function(error, result){
			if(error){
				alert("There is no autocomplete suggested !");
			}
			else{
				//Delete all elements in collection	
				//Meteor.call("flushAllSuggests");

				//Refresh collection
				for (var i = result.Places.length - 1; i >= 0; i--) {
					Meteor.call("insertAutoSuggest", result.Places[0]);
				}
			}

			});

			//Add the new Amadeus airport autocomplete
			var depAutoSuggest = Meteor.call("getAmadeusAirportAutocomplete", departureFrom.value, function(err, res){
				if(!err){
					//Meteor.call("flushAllSuggests");
					//Refresh collection
					for (var i = res.data.length - 1; i >= 0; i--) {
						Meteor.call("insertAutoSuggest", res.data[i]);
					}
				}
				else{
					console.log(err);
				}
			});
		}
	},

	'mouseenter .infoBul' : function(e){
		
	},
	'mouseleave .infoBul' : function(e){
		console.log("this is it");
	},


	//-------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------------------------
});

sanityCheck = function(departureFrom, departureDate, selectedIp, totalNbDays, nbAdults, nbChildren, nbInfants){
	var passedSC = false;
	var messageSC = "";

	if(departureFrom==""){
		messageSC = "Please enter a departure place";
	}
	/*else if(!(/^[a-zA-Z]+$/.test(departureFrom))){
		messageSC = "Please make sur you enter only letters in the departure field";
	}*/
	else if(moment(departureDate).isBefore(moment())){
		messageSC = "Please enter a departure date after today";
	}
	else if(selectedIp.length<1){
		messageSC = "Select at least one destination";
	}
	else if(selectedIp.length>8){
		messageSC = "You cannot select more than 8 destinations";
	}
	else if(parseInt(nbAdults)+parseInt(nbChildren)+parseInt(nbInfants)>8){
		messageSC = "Number of travelers cannot be above 8";
	}
	else if(totalNbDays>22){
		messageSC = "The total number of nights must be less than 22 days";
	}
	else{
		passedSC = true;
	}
	return [passedSC, messageSC];
}