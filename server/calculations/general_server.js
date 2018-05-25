Meteor.methods({
//return ip from ipDays
	getIp : function(ipDays){

		var ip = [];

		_.forEach(ipDays, function(ipd){
			ip.push(ipd.ip);
		});

		return ip;
	},

	getCodeArr : function(ipDays, currency, locale, market){

		var codeArr = [];

		_.forEach(ipDays, function(ipa){
			Meteor.call("getPlaceAutosuggest", ipa.ip.city, currency, locale, market, function(err, result){
				if(err){
					console.log(err);
				}
				else{
					if(result.Places[0]){
						codeArr.push({ip : ipa.ip, code : result.Places[0].PlaceId, nbDays : ipa.nbDays});
					}
				}
			});
		});

		return codeArr;
	},

	getUniqueValues: function(array){
		var n = {},r=[];
		_.forEach(array, function(array){
			if (!n[array]){
				n[array] = true; 
				r.push(array); 
			}
		});
		return r;
	},

	updateIpDays : function(ips, days){

		var selectedIpDays = [];

		for (var i=0; i<days.length; i++){
			var obj =  {
				ip : ips[i], 
				nbDays : parseInt(days[i],10)
			};
			selectedIpDays.push( obj );
		}

		return selectedIpDays;
	},

	findCircuitSync : function(ips){

		var SyncCircuit = Meteor.wrapAsync(findCircuitAsync);
		try {
			return SyncCircuit(ips);
		}
		catch (e) {
			console.log('erreur', e.message);
			throw new Meteor.Error(500, e);
		}
	},

	getDistances : function(ip1, ip2){

		var url = "https://maps.googleapis.com/maps/api/distancematrix/json?origins="+ip1.lat+","+ip1.lng+"&destinations="+ip2.lat+","+ip2.lng+"&key="+googleKey;
		response = HTTP.get(url);
		return response.data.rows[0].elements[0].distance.value;
    },
    
	getIpAddress : function(){
		return this.connection.clientAddress;
	},
});

var findCircuitAsync = function(ips, cb){
	setTimeout(function() {
		if (ips) {
			cb && cb(null, ips);
		} 
		else {
			cb && cb('no IP has been selected');
		}
	}, 4000);
};
