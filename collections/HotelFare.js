HotelFares = new Mongo.Collection("hotelFares");

Meteor.methods({
	'insertHotelFares': function(doc){
    	return HotelFares.insert(doc);
	},

	'flushAllHotelFares': function(){
    	HotelFares.remove({});
  }
});