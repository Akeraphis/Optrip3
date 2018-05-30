Meteor.methods({

	//Import des aéroports depuis la liste JSon

	importAirports : function(){
		var myAirports = {};
		myAirports = JSON.parse(Assets.getText('AirportsList.json'));

		_.forEach(myAirports, function(myAirports){
			Meteor.call("insertAirport", myAirports, function(err,id){if(err){alert(err.reason);}});
		})
	},

	//Import des villes depuis une liste JSon

	importCities : function(){
		var myCities = {};
		myCities = JSON.parse(Assets.getText('CitiesList2.json'));

		_.forEach(myCities, function(myCities){
			Meteor.call("insertIP", myCities, function(err,id){if(err){alert(err.reason);}});
		})
	},

	importAirlines : function(){
		var myAirlines = {};
		myAirlines = JSON.parse(Assets.getText('AirlinesList.json'));

		_.forEach(myAirlines, function(mair){
			Meteor.call("insertAirline", mair, function(err,id){if(err){alert(err.reason);}});
		})
	},
	importHotelDetails : function(){
		var myHotelDetails = {};
		myHotelDetails = JSON.parse(Assets.getText('hotel_details.json'));

		_.forEach(myHotelDetails, function(mhd){
			Meteor.call("insertHotelDetails", mhd, function(err,id){if(err){alert(err.reason);}});
		})
	}
});