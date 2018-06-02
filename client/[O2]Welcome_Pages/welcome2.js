Template.circuit.helpers({
	'trips': function(){
		Meteor.subscribe("allTrips");
		return Trips.find({country: Session.get("selectedCountry")}).fetch()
	}
});

Template.circuit.events({
	'click .dropdown-item': function(){
		document.getElementById('dropCircuit').innerHTML=this.name;
		var ips = [];
		var nbDays = [];

		_.forEach(this.circuit, function(c){
			ips.push(c.ip);
			nbDays.push(c.nbDays);
		});

		Session.set("selectedIp", ips);
		Session.set('nbDays', nbDays);
		Session.set("ipDays", this.circuit);
	}
});

Template.nextButton2.events({
	'click .next2': function(){
		FlowRouter.go('/3');
	},
});