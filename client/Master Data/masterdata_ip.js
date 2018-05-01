
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
	'click .btn-danger': function(){
		Meteor.call("deleteIP", this._id, function(err, id){
		if(err){
			alert(err.reason);
		}
		})
	},
	
	//create some test Data
	'click .generateIp' : function(){
		Meteor.call("importCities", function(err,id){if(err){alert(err.reason);}});
	},

		//flush all airports
	'click .flushCities': function(){
		Meteor.call("flushAllCities", function(err,id){if(err){alert(err.reason);}});
	},
});

//Helpers Cities/IP template
Template.mdip.helpers({
	myCollection: function () {
        return InterestPoints;
    }
});