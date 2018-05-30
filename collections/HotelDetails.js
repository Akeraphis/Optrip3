HotelDetails = new Mongo.Collection("hotelDetails");

Meteor.methods({
	'insertHotelDetails': function(doc){
		return HotelDetails.insert(doc);
	},
	'deleteHotelDetails': function(doc){
		return HotelDetails.remove(doc);
	},
	//Vider la collection d'aéroports
	'flushAllHotelDetails' : function(){
		HotelDetails.remove({});
	},
})