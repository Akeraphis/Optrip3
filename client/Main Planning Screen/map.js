//Create a session to select IPs
Session.set("selectedIp", []);
var map=null;
var markers = [];
var googleKey = 'AIzaSyBa-oHgHxxTBaIhoFz8koYTBlHcuCyfiIk';

Session.set("selectedCurrency", "EUR");
Session.set("selectedLocal", "en-GB");
Session.set('nbPersons', 2);
Session.set('departureFrom',"");
Session.set('departureDate', "");
Session.set('nbDays', []);
Session.set("minTotalPrice", Infinity);
Session.set("results", []);
Session.set("nbChildren", 0);
Session.set("nbInfants", 0);
Session.set("selectedMarket", "FR");


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
          		location:request[i].ip.city,
          		stopover:true
          	});
		}
	}

	var req2 = {
    	origin: request[0].ip.city,
    	destination: request[0].ip.city,
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

	marker.setIcon('https://maps.google.com/mapfiles/kml/shapes/placemark_circle_highlight_maps.png');
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

Template.home.helpers({
	settings: function() {
		return {
			position: Session.get("position"),
			limit: 10,
			rules: [
				{
				// token: '',
					collection: AutoSuggest,
					field: 'PlaceName',
					matchAll: true,
					template: Template.displayDeparture
				}
			]
		};
	}
});

Template.selectedIPs.helpers({
	selectedIp : function(){
		return Session.get("selectedIp");
	}
});

Template.home.events({

	//-------------------------------------------------------------------------------------------------
	// Function called when the user clicks on the optimize button
	//-------------------------------------------------------------------------------------------------
	'submit .startingPanel' : function(e){

		// prevent reset of the form
		e.preventDefault();

		//create all variables to get values in the form
		var departureFrom = document.getElementById("departurePoint");
		var departureDate = document.getElementById("departureDate");
		var nbDaysElements = document.getElementsByName('NbDays');
		var nbPersons = document.getElementById("NbPerson");
		var nbChildren = document.getElementById("NbChildren");
		var nbInfants = document.getElementById("NbInfants");
		var nbDays = [];

		Session.set("nbPersons", nbPersons.value);
		Session.set("nbChildren", nbChildren.value);
		Session.set("nbInfants", nbInfants.value);
		console.log("Adults :", Session.get("nbPersons"));
		Session.set("departureDate", departureDate.value);
		Session.set("departureFrom", departureFrom.value);



		for (var i=0; i<nbDaysElements.length; i++){
			nbDays.push(nbDaysElements[i].value);
		}

		Session.set('nbDays', nbDays);
		var totalDays = 0;

		Router.go('/optimization/results');

		console.log(Session.get('selectedIp'), Session.get('nbDays'));

		//Call the update method for selectedIPDays
		Meteor.call("updateIpDays", Session.get('selectedIp'), Session.get('nbDays'), function(error, result){
			if (error){
				console.log(error.reason);
			}
			else{

				console.log(Session.get("departureFrom"), Session.get("departureDate"), result, Session.get('selectedCurrency'), Session.get('nbPersons'), Session.get("nbChildren"), Session.get("nbInfants"), Session.get("selectedLocal"), Session.get("selectedMarket"));
				//send this information to the server to optimize and return result
				Meteor.call('optimizeTrip', Session.get("departureFrom"), Session.get("departureDate"), result, Session.get('selectedCurrency'), Session.get('nbPersons'), Session.get("nbChildren"), Session.get("nbInfants"), Session.get("selectedLocal"), Session.get("selectedMarket"), function(error, res){
					if(error){
						alert("This is an error while updating the fares!");
					}
					else{
						Session.set("results", res[0][1]);
						Session.set("minTotalPrice", res[0][0]);
						Session.set("optimalCircuit", res[0][2]);
						console.log(res);
						Session.set("totalResults", res);
						var request = Session.get("optimalCircuit");
						drawRoute(GoogleMaps.maps.map.instance, request);
					}
				});
			}
		});
	},


	'keypress .form-control' : function(e){
		
		var departureFrom = document.getElementById("departurePoint");

		if(departureFrom.value.length >= 1){
			var depAutoSuggest = Meteor.call("getPlaceAutosuggest", departureFrom.value, "EUR", "en-GB", "FR", function(error, result){
			if(error){
				alert("There is no autocomplete suggested !");
			}
			else{
				//Delete all elements in collection	
				//Meteor.call("flushAllSuggests");

				//Refresh collection

				if(result.Places[0]){Meteor.call("insertAutoSuggest", result.Places[0]);}
				if(result.Places[1]){Meteor.call("insertAutoSuggest", result.Places[1]);}
				if(result.Places[2]){Meteor.call("insertAutoSuggest", result.Places[2]);}
				if(result.Places[3]){Meteor.call("insertAutoSuggest", result.Places[3]);}
				if(result.Places[4]){Meteor.call("insertAutoSuggest", result.Places[4]);}
				if(result.Places[5]){Meteor.call("insertAutoSuggest", result.Places[5]);}
				if(result.Places[6]){Meteor.call("insertAutoSuggest", result.Places[6]);}
				if(result.Places[7]){Meteor.call("insertAutoSuggest", result.Places[7]);}
				if(result.Places[8]){Meteor.call("insertAutoSuggest", result.Places[8]);}
			}

			});	
		}

	},

	//-------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------------------------
});
