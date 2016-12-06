Template.nbTravelers.events({
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