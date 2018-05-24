Template.map3.helpers({
	//Set up the map options
	mapOptions: function() {
	// Make sure the maps API has loaded
		if (GoogleMaps.loaded()) {
			// Map initialization options
			var res = Session.get("selectedLiveHotels");
			var city = FlowRouter.getParam('city');
			var checkin = FlowRouter.getParam('checkin');
			var checkout = FlowRouter.getParam('checkout');
			var res2={};
			_.forEach(res, function(lh){
				if(lh.checkout == checkout && lh.checkin== checkin && lh.location.city == city){
					res2 = lh;
				}
			});
			var firstCity = res2.hotelFare.results;
			map = {
				center: new google.maps.LatLng(firstCity[0].location.latitude, firstCity[0].location.longitude),
				zoom: 10
			};
			return map;
		}
	},
});


Template.map3.onCreated(function(){

	var self = this;

	GoogleMaps.ready('map', function(map) {
		self.autorun(function() {

			var res = Session.get("selectedLiveHotels");
			var city = FlowRouter.getParam('city');
			var checkin = FlowRouter.getParam('checkin');
			var checkout = FlowRouter.getParam('checkout');
			var res2={};
			_.forEach(res, function(lh){
				if(lh.checkout == checkout && lh.checkin== checkin && lh.location.city == city){
					res2 = lh;
				}
			});
			var hotels = res2.hotelFare.results;

			//Loop to add markers for Hotels
		    _.forEach(hotels, function(hot){

		    	//add marker for considered ip
		    	var myLatlng = new google.maps.LatLng(hot.location.latitude, hot.location.longitude);
		    	var k = 0;

		    	var marker = addMarker2(myLatlng, hot.property_name, map.instance);

		    	//Add info window
				var contentString = '<b>'+hot.property_name + '</b>, ' + hot.address.city;
				var infowindow = new google.maps.InfoWindow({content: contentString, disableAutoPan : true});


				//Add event to display info upon hovering
				google.maps.event.addListener(marker, 'mouseover', function(){
					infowindow.open(map.instance,marker);
				});

				//Add event to undisplay when mouse is leaving the marker
				google.maps.event.addListener(marker, 'mouseout', function(){
					infowindow.close(map.instance, marker);
				});
		    });
		});
	});
});

// Add a marker to the map and push to the array.
function addMarker2(location, title, map, rating) {
	var icon = {
	    url: "https://use.fontawesome.com/releases/v5.0.13/svgs/solid/home.svg", // url
	    scaledSize: new google.maps.Size(30,30), // scaled size
	    origin: new google.maps.Point(0,0), // origin
	    anchor: new google.maps.Point(0, 0) // anchor
	};


	var marker = new google.maps.Marker({
		position: location,
		title: title,
		map: map,
		label : rating,
		icon : icon
	});
	return marker;
};
