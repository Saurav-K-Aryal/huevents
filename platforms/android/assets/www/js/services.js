angular.module('app.services', [])

.factory('BlankFactory', [function(){

}])

.service('EventsService', function($http){
	var baseURL = "https://api.parse.com/1/classes/Events";

	var authHeaders = PARSE__HEADER_CREDENTIALS;

	var defaultSettings = {
            "async": true,
            "crossDomain": true,
            headers: authHeaders,
        };

    return {
    	addEvent: function(eventDetails) {
            return $http.post(baseURL, eventDetails, defaultSettings)
                    .then(function (success) {
                        // In the response resp.data contains the result
                        // check the console to see all of the data returned
                        console.log('addObject', success);
                        return success.data;
                    }, function(error) {
                    	console.log('error in addEvent', error);
                    });
    	},
    	getAllEvents: function() {
    		return $http.get(baseURL, defaultSettings)
    				.then(function(success) {
    					console.log('got all events', success)
    					return success;
    				}, function(error) {
    					console.log('error in getAllEvents', error);
    				})
    	},
    	getEventbyID: function(_id) {
    		return $http.get(baseURL + '/' + _id, defaultSettings)
    				.then(function(success) {
    					console.log('got single event', success);
    					return success.data;
    				}, function(error) {
    					console.log('error in getEventbyID', error);
    				})
    	},
    	getEventsbyCategory: function(category) {
    		var params = {
    			"category": category
    		}
			return $http.get(baseURL + "?where=" + JSON.stringify(params), defaultSettings)
    			.then(function(response) {
    				console.log(response);
    				return response;
    			}, function(error){
    				console.log("error in getEventsbycategory", error)
    			});
    	},
    }
});

