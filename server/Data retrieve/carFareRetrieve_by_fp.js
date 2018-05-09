var urlAPIStructure = "https://api-dev.fareportallabs.com/air/api/search/searchflightavailability";
import { base64 } from 'meteor/ostrio:base64';

Meteor.methods({
	'updateCarFares': function(codeArr, depDate, retDate, currency, alreadyExists, locale, market){

		var pickupdatetime = depDate + "T10:00";
		var dropoffdatetime = retDate + "T18:00";
		var userip = Meteor.call('getIP');
		var driverage = 30;
		var res = {};
		var dateNow = new Date();

		//Fareportal implementation
		//Create Authorization header
		const nativeB64 = new base64({ useNative: true });
		var svcCredentials = nativeB64.encode(FPUsername + ":" + FPPassword);
		
	},
})