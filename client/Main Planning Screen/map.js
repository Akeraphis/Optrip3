//Create a session to select IPs
Session.set("selectedIp", []);
var map=null;
var markers = [];
var googleKey = 'AIzaSyBa-oHgHxxTBaIhoFz8koYTBlHcuCyfiIk';

//Open Google maps on startup; fill in the key
Meteor.startup(function() {
	GoogleMaps.load({key : googleKey});
});


//----------------------------------------------------------------------------------------------------------
//MAP HELPERS
//----------------------------------------------------------------------------------------------------------

Template.map.helpers({

	//Set up the map options
	mapOptions: function() {
	// Make sure the maps API has loaded
		if (GoogleMaps.loaded()) {
		// Map initialization options
			map = {
				center: new google.maps.LatLng(48.850041, 2.268737),
				zoom: 7
			};
			return map;
		}
	}

});


Template.map.onCreated(function() {

  // We can use the `ready` callback to interact with the map API once the map is ready.
	GoogleMaps.ready('map', function(map) {

		//-------------------------------------------------------------------------------------------------
		// Position all Interest Points on the map, add info on hovering and events linked to the markers
		//-------------------------------------------------------------------------------------------------
	    // retrieve all IPs and display them on the map
		var ipArray = InterestPoints.find().fetch();

		//Loop to add all IPs
	    _.forEach(ipArray, function(ip){

	    	//add marker for considered ip
	    	var myLatlng = new google.maps.LatLng(ip.lat, ip.lng);
	    	var k = 0;

	    	var marker = addMarker(myLatlng, ip.city, map.instance);

	    	//Add info window
			var contentString = '<b>'+ip.city + '</b>, ' + ip.province + ', '+ ip.country;
			var infowindow = new google.maps.InfoWindow({content: contentString, disableAutoPan : true});


			//Add event to display info upon hovering
			google.maps.event.addListener(marker, 'mouseover', function(){
				infowindow.open(map.instance,marker);
			});

			//Add event to undisplay when mouse is leaving the marker
			google.maps.event.addListener(marker, 'mouseout', function(){
				infowindow.close(map.instance, marker);
			});

			//Set to selected/unselected upon clicking
			google.maps.event.addListener(marker, 'click', function(){
				//if the ip is already selected
				if (IsSelected(ip)){
					UnSelectCity(ip);
					marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red.png');
				}
				//if it is not already selected
				else{
					SelectCity(ip);
					marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green.png');
					marker.setLabel("");
				}
			});

	    });

	});
});


//-------------------------------------------------------------------------------------------------
// Function used to add interest point in selected interest point session
//-------------------------------------------------------------------------------------------------

//Function to add a city to the selection list

function SelectCity(ip){
	var selectedIp = Session.get("selectedIp");
	selectedIp.push(ip);
	Session.set("selectedIp", selectedIp);
};

//Function to know if an ip is already selected

function IsSelected(ip){

	var selectedIp = Session.get("selectedIp");
	var c = selectedIp.length;
	var k=0;
	var ipId = ip.city;

	for (var i=0; i<c; i++){
		if(selectedIp[i]){
			if(selectedIp[i].city == ipId){
				k++;
			}
		}
	}

	if (k==0){return false;}
	else{return true;}
};

//Function to remove a city from the selection list
function UnSelectCity(ip){
	var selectedIp = Session.get("selectedIp");
	var c = selectedIp.length;
	var ipId = ip.city;

	for (var i=0; i<c; i++){
		if(selectedIp[i]){
			if(selectedIp[i].city == ipId){
				selectedIp.splice(i,1);
			}
		}
	}

	Session.set("selectedIp", selectedIp);
};

//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------

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

function drawRoute(map, request){

	setAllMap(null);

	var directionsDisplay = new google.maps.DirectionsRenderer();
	var directionsService = new google.maps.DirectionsService();
	directionsDisplay.setMap(map);
	var waypts = [];

	if(request.length>=2) {
		for (var i=1; i<request.length; i++){
			waypts.push({
          		location:request[i].city,
          		stopover:true
          	});
		}
	}

	var request = {
    	origin: request[0].city,
    	destination: request[0].city,
    	waypoints : waypts,
    	optimizeWaypoints : true,
    	travelMode: google.maps.TravelMode.DRIVING
  	};

	directionsService.route(request, function(response, status) {
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

//-------------------------------------------------------------------------------------------------
// Markers manipulation functions
//-------------------------------------------------------------------------------------------------

// Sets the map on all markers in the array.
function setAllMap(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
};

// Add a marker to the map and push to the array.
function addMarker(location, title, map, rating) {
	var marker = new google.maps.Marker({
		position: location,
		title: title,
		map: map,
		label : rating
	});

	marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red.png');
	markers.push(marker);
	return marker;
};

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setAllMap(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setAllMap(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}