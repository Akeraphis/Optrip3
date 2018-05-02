Meteor.subscribe("allAirports");

Template.mdairports.helpers({
	'airports': function(){
		return Airports.find({});
	}
})

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

