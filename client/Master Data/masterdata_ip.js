
Template.mdips.events({

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

	//create some test Data
	'click .generateIp' : function(){
		Meteor.call("importCities", function(err,id){if(err){alert(err.reason);}});
	},

		//flush all airports
	'click .flushCities': function(){
		Meteor.call("flushAllCities", function(err,id){if(err){alert(err.reason);}});
	},

	'click .reactive-table tbody tr': function (event) {
		// set the blog post we'll display details and news for
		var post = this;
		Session.set("selectedIp", this);
		FlowRouter.go('/masterdata/interestPoints/'+this._id);

	}
});

//Helpers Cities/IP template
Template.mdips.helpers({
	myCollection: function () {
		Meteor.subscribe("allInterestPoints");

        return InterestPoints.find({}).fetch();
    },
});

Template.mdip.helpers({
	'getCity': function(){
		Meteor.subscribe("allInterestPoints");
		var id = FlowRouter.getParam('ipid');
		return InterestPoints.findOne({_id : id});
	},
	'getAirportName': function(code){
		Meteor.subscribe("Airports");
		if(code!=""){
			return Airports.findOne({code : code}).name;
		}
	},
	'getAirport': function(c){
		Meteor.subscribe("Airports");
		return Airports.find({country: c}).fetch();
	}
});

Template.mdip.events({
	'click .returnToIpList': function(){
		FlowRouter.go('/masterdata/interestPoints/')
	},
	'click .addAirportToIP': function(){
		var airportSelected = $("#airport-select").val();
		var airport = Airports.findOne({name : airportSelected});
		var ipid = FlowRouter.getParam('ipid');
		if(airport){
			InterestPoints.update({_id : ipid}, {$push : {airports : {code : airport.code}}});
		}
	}
});