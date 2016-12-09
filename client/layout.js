import 'bootstrap/dist/css/bootstrap.css';

Template.mainLayout.events({
	'click .dropdown-toggle': function(e){
		$('.dropdown-toggle').dropdown();
	}
});

Template.mainLayout.events({
	'click .mainLayout': function(e){
		if (!$('.dropdown').is(e.target) && $('.dropdown').has(e.target).length === 0 && $('.open').has(e.target).length === 0){
        	$('.dropdown').removeClass('open');
    	}
	}
})

Template.dropDownCurrency.helpers({
	Currencies: function(){
    	return Currencies.find().fetch();
	}
})

Template.dropDownCurrency.events({
	"click .cur": function(e){
		var currency = ($(e.currentTarget)[0].text).substring(0,3);
		Session.set("selectedCurrency", currency);
        console.log("currency : " + Session.get('selectedCurrency'));
	}
})