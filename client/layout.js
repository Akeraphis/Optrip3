import 'bootstrap/dist/css/bootstrap.css';

Template.mainLayout.events({
	'click .navbar-brand': function(){
		Session.set('selectedIp',[]);
		FlowRouter.go('/');
	},
	'click .dropdown-toggle': function(e){
		$('.dropdown-toggle').dropdown();
	}
});

Template.dropDownCurrency.helpers({
	Currencies: function(){
    	return Currencies.find().fetch();
	}
});

Template.dropDownCurrency.events({
	"click .cur": function(e){
		var currency = ($(e.currentTarget)[0].text).substring(0,3);
		Session.set("selectedCurrency", currency);
        console.log("currency : " + Session.get('selectedCurrency'));
        document.getElementById("curr").innerHTML=$(e.currentTarget)[0].text;
	}
});

Template.dropDownLocale.helpers({
	Locales: function(){
    	return Locales.find().fetch();
	}
});

Template.dropDownLocale.events({
	"click .loc": function(e){
		var locale = ($(e.currentTarget)[0].text).substring(0,5);
		Session.set("selectedLocal", locale);
        console.log("locale : " + Session.get('selectedLocal'));
        document.getElementById("loca").innerHTML=($(e.currentTarget)[0].text).substring(8);
	}
});

Template.dropDownMarket.helpers({
	Markets: function(){
    	return Markets.find().fetch();
	}
});

Template.dropDownMarket.events({
	"click .mar": function(e){
		var market = ($(e.currentTarget)[0].text).substring(0,2);
		Session.set("selectedMarket", market);
        console.log("market : " + Session.get('selectedMarket'));
        document.getElementById("mark").innerHTML=($(e.currentTarget)[0].text).substring(5);
	}
});