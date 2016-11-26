//---------------------------------------------------------
//HELPERS MASTERDATA
//---------------------------------------------------------

//Helpers Cities/IP template
Template.mdip.helpers({
	//return latitude of city
	latitude : function(geometry){
		return geometry.coordinates[1]
	},

	//return longitude of city
	longitude: function(geometry){
		return geometry.coordinates[0]
	}
});


//---------------------------------------------------------
//EVENTS MASTERDATA
//---------------------------------------------------------

//Events Airports
Template.mdairports.events({
	//Create a new airport
	'submit form': function(e){
		e.preventDefault();
		var name = $("input[name='name']").val();
		var code = $("input[name='code']").val();
		var city = $("input[name='city']").val();
		var country = $("input[name='country']").val();

		var airport = {
			name: name,
			city : city,
			country: country,
			code: code
		};

		Meteor.call("insertAirport", airport, function(err, id){
			if(err){
				alert(err.reason);
			}
		})

	},

	//Delete airport
	'click .delete': function(){
		Meteor.call("deleteAirport", this._id, function(err,id){
			if(err){
				alert(err.reason);
			}
		});
	},

	//Call the import of airport list
	'click .generateAirports': function(){
		Meteor.call("importAirports", function(err,id){if(err){alert(err.reason);}});
	},

	//flush all airports
	'click .flushAirports': function(){
		Meteor.call("flushAllAirports", function(err,id){if(err){alert(err.reason);}});
	}
});



Template.mdip.events({

	//create a new interest point
	'submit form': function(e){
		e.preventDefault();
		var name = $("input[name='name']").val();
		var latitude = $("input[name='latitude']").val();
		var longitude = $("input[name='longitude']").val();
		var description = $("input[name='description']").val();
		var country = $("input[name='country']").val();

		var ip = {
			name: name,
			latitude : latitude,
			longitude: longitude,
			description: description,
			country: country,
			airports: [{
				airportCode : "",
				airportName : ""
			}]
		};

		Meteor.call("insertIP", ip, function(err, id){
			if(err){
				alert(err.reason);
			}
			else{
				$("form input").val("");
			}
		})
	},

	//delete selected interest point
	'click .delete': function(){
		Meteor.call("deleteIP", this._id, function(err, id){
		if(err){
			alert(err.reason);
		}
		})
	},

	//change the name of the ip
	'click .ipname': function(){
		//Enter into a variable the new name of the interest point
		var newIpName = prompt("you want to change this interest point name ?", this.name);
		if(newIpName){
					Meteor.call("editIP", this._id, "name", newIpName, function(err,id){
			if(err){
				alert(err.reason);
			}
		})
		}
	},

	//Change the latitude of the ip
	'click .iplatitude': function(){
		//Enter into a variable the new latitude of the interest point
		var newIpName = prompt("you want to change this interest point latitude ?", this.latitude);
		if(newIpName){
			Meteor.call("editIP", this._id, "latitude", newIpName, function(err,id){
			if(err){
				alert(err.reason);
			}
		})
		}
	},

	//Change the longitude ip
	'click .iplongitude': function(){
		//Enter into a variable the new longitude of the interest point
		var newIpName = prompt("you want to change this interest point longitude ?", this.longitude);
		if(newIpName){
			Meteor.call("editIP", this._id, "longitude", newIpName, function(err,id){
			if(err){
				alert(err.reason);
			}
		})
		}
	},

	//create some test Data
	'click .generateIp' : function(){
		Meteor.call("importCities", function(err,id){if(err){alert(err.reason);}});
	},

		//flush all airports
	'click .flushCities': function(){
		Meteor.call("flushAllCities", function(err,id){if(err){alert(err.reason);}});
	}
});


Template.mdff.events({

	'click .refreshFlightFare': function(){
		Meteor.call('flushAllFares', function(err,id){if(err){alert(err.reason);}});
		Meteor.call('importAllFares', function(err,id){if(err){alert(err.reason);}});
	},

	'click .flushAllFares': function(){
		Meteor.call('flushAllFares', function(err,id){if(err){alert(err.reason);}});
	}

});


Template.mdothers.events({
	'click .getAllCurrencies': function(){
		var res = Meteor.call('retrieveCurrencies');
		console.log(res);
	},

	'click .flushAllCurrencies': function(){
		Meteor.call('flushAllCurrencies', function(err,id){if(err){alert(err.reason);}})
	},
});