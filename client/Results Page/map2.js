Template.map2.helpers({
	//Set up the map options
	mapOptions: function() {
	// Make sure the maps API has loaded
		if (GoogleMaps.loaded()) {
		// Map initialization options
			var firstCity = Session.get("newIpDays")[0];
			map = {
				center: new google.maps.LatLng(firstCity.ip.lat, firstCity.ip.lng),
				zoom: 7
			};
			return map;
		}
	},
});

Template.map2.onCreated(function(){

	var self = this;

	GoogleMaps.ready('map', function(map) {
		self.autorun(function() {

			var hotels=Session.get("cheapestLiveHotels");
			var car = Session.get("selectedCar");

			//Loop to add markers for Hotels
		    _.forEach(hotels, function(hot){

		    	var h=hot.hotelFare.results;
		    	//add marker for considered ip
		    	var myLatlng = new google.maps.LatLng(h.location.latitude, h.location.longitude);
		    	var k = 0;

		    	var marker = addMarker2(myLatlng, h.property_name, map.instance);

		    	//Add info window
				var contentString = '<b>'+h.property_name + '</b>, ' + h.address.city;
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

		    if(car){
			    			    //Car Marker
			    var myLatlng2 = new google.maps.LatLng(car.location.latitude, car.location.longitude);
			    	var icon2 = {
						url: "https://use.fontawesome.com/releases/v5.0.13/svgs/solid/car.svg", // url
						scaledSize: new google.maps.Size(30,30), // scaled size
						origin: new google.maps.Point(0,0), // origin
						anchor: new google.maps.Point(0, 0) // anchor
					};

			    new google.maps.Marker({
					position: myLatlng2,
					icon : icon2,
					map: map.instance
				});

			    //Draw Route
			    drawRoute2(map.instance,car, hotels);
		    }

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

//-------------------------------------------------------------------------------------------------
// Function used to draw Circuit on the map with crow flies
//-------------------------------------------------------------------------------------------------

function drawCircuit(map, circuit){

	var polyOptions = {
		strokeColor: '#ff7800',
		strokeOpacity: 0.7,
		strokeWeight: 5
	};

	poly = new google.maps.Polyline(polyOptions);
	poly.setMap(map);

	var path = poly.getPath();
	var myLatlng = new google.maps.LatLng(circuit[0].lat, circuit[0].lng);
	path.push(myLatlng);

	_.forEach(circuit, function(ip){
	
		var myLatlngi = new google.maps.LatLng(ip.lat, ip.lng);
		path.push(myLatlngi);

	});

	path.push(myLatlng);
}

//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------
// Function used to draw really route using a CAR
//-------------------------------------------------------------------------------------------------

function drawRoute2(map, car, hotels){

	//setAllMap(null);
	var directionsDisplay = new google.maps.DirectionsRenderer();
	var directionsService = new google.maps.DirectionsService();
	directionsDisplay.setMap(map);
	var waypts = [];

	if(hotels.length>=2) {
		_.forEach(hotels, function(hot){
			var h=hot.hotelFare.results;
			var myLatlng = new google.maps.LatLng(h.location.latitude, h.location.longitude);
			waypts.push({
          		location:myLatlng,
          		stopover:true
          	});
		});
	}
	var myLatlng2 = new google.maps.LatLng(car.location.latitude, car.location.longitude);
	var req2 = {
    	origin: myLatlng2,
    	destination: myLatlng2,
    	waypoints : waypts,
    	optimizeWaypoints : true,
    	travelMode: google.maps.TravelMode.DRIVING
  	};

	directionsService.route(req2, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(response);
		}
		else{
			window.alert('Directions request failed due to' + status);
		}

	});
};
//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------
