Template.masterdata_tripCreation.helpers({
	settings2: function() {
		Meteor.subscribe("allCountries");
		return {
			position: Session.get("position"),
			limit: 10,
			rules: [
				{
					collection: Countries,
					field: 'name',
					matchAll: true,
					template: Template.displayDestination
				}
			]
		};
	}
});

Template.masterdata_tripCreation.events({
	'click .back': function(){
		FlowRouter.go("/masterdata/trips")
	},
	'click .newTrip': function(){
		var country = document.getElementById('country').value;
		var tripName= document.getElementById('tripName').value;
		var nbDaysElements = document.getElementsByName('NbDays');
		var nbDays = [];
		var totalNbDays = 0;

		for (var i=0; i<nbDaysElements.length; i++){
			nbDays.push(nbDaysElements[i].value);
			totalNbDays += parseInt(nbDaysElements[i].value);
		}

		Session.set('nbDays', nbDays);
		 Meteor.call("updateIpDays", Session.get('selectedIp'), Session.get('nbDays'), function(err,res){
			if(err){console.log(err)}
			else{
				Session.set('ipDays',res);
				var obj = {
					name: tripName,
					country: country,
					circuit: res
				}
				Meteor.call("insertTrip", obj);
				FlowRouter.go("/masterdata/trips");
			}
		});
	}
})