Template.welcome1.helpers({
	settings: function() {
		return {
			position: Session.get("position"),
			limit: 10,
			rules: [
				{
					collection: AutoSuggest,
					field: 'label',
					matchAll: true,
					template: Template.displayDeparture
				}
			]
		};
	},
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

Template.nextButton.events({
	'click .next': function(){
		var whereToGo = document.getElementById('whereToGo').value;
		Session.set('selectedCountry', whereToGo);
		FlowRouter.go('/2')
	}
})