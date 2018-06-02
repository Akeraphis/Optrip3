Template.authenticOrClassy.onRendered(function(){

	var $range = $("#authenticOrClassy");

	$range.ionRangeSlider({
	    type: "simple",
	    grid: false,
	    min: 0,
	    max: 100,
	    step: 0.5,
	    postfix: "%",
	});
});