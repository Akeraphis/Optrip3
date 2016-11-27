Meteor.methods({

	//Import des aéroports depuis la liste JSon

	importAirports : function(){
		var myAirports = {};
		myAirports = JSON.parse(Assets.getText('AirportsList.json'));

		_.forEach(myAirports, function(myAirports){
			if (myAirports.size == "large") {
				Meteor.call("insertAirport", myAirports, function(err,id){if(err){alert(err.reason);}});
			};
		})
	},

	//Import des villes depuis une liste JSon

	importCities : function(){
		var myCities = {};
		myCities = JSON.parse(Assets.getText('CitiesList2.json'));

		_.forEach(myCities, function(myCities){
			Meteor.call("insertIP", myCities, function(err,id){if(err){alert(err.reason);}});
		})
	}
})