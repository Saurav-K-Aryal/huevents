angular.module('app.services', [])

.factory('BlankFactory', [function(){

}])

.service('ParseService', function($http){
	var baseURL = "https://api.parse.com/1/classes";

	var authHeaders = PARSE__HEADER_CREDENTIALS;

	var defaultSettings = {
            "async": true,
            "crossDomain": true,
            headers: authHeaders,
        };

    return {
    	addEvent: function(eventDetails) {
            return $http.post(baseURL + '/Events', eventDetails, defaultSettings)
                    .then(function (success) {
                        // In the response resp.data contains the result
                        // check the console to see all of the data returned
                        console.log('addObject ', success);
                        return success.data;
                    }, function(error) {
                    	console.log('error in addEvent', error);
                    });
    	},
    	getAllEvents: function() {
    		return $http.get(baseURL + '/Events', defaultSettings)
    				.then(function(success) {
    					console.log('got all events', success)
    					return success;
    				}, function(error) {
    					console.log('error in getAllEvents', error);
    				})
    	},
    	getEventbyID: function(_id) {
    		return $http.get(baseURL + '/Events/' + _id, defaultSettings)
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
			return $http.get(baseURL + "/Events?where=" + JSON.stringify(params), defaultSettings)
    			.then(function(response) {
    				console.log(response);
    				return response;
    			}, function(error){
    				console.log("error in getEventsbycategory", error)
    			});
    	},
        addUser: function(UserData) {
            return $http.post(baseURL + "/User", UserData, defaultSettings)
                .then(function(_response) {
                    console.log(_response);
                    return _response;
                });
        },

        getUser: function(UserId) {
            var params = {
                "fb_id": UserId
            }
            return $http.get(baseURL + "/User?where=" + JSON.stringify(params), defaultSettings)
                .then(function(_response) {
                    console.log(_response);
                    return _response;
                });
        },
    }
})


.service('FacebookAuth', function($http, $state, $q, $cordovaFacebook, ParseService){
    var currentUser = {
        "id": null
    };

    var login = function() {
        return $cordovaFacebook.login(["public_profile", "email"])
            .then(function (success) {
                // save access_token
                var accessToken = success.authResponse.accessToken;
                var userID = success.authResponse.userID;
                var expiresIn = success.authResponse.expiresIn;
 
                console.log("Login Success" + JSON.stringify(success));

                var expDate = new Date(
                    new Date().getTime() + expiresIn * 1000
                ).toISOString();
                
                var fbValues = "&fields=id,name,picture,email";
                var fbPermission = ["public_profile", "email"];

                $cordovaFacebook.api("me?access_token=" + accessToken + fbValues, fbPermission)
                    .then(function (_fbUserInfo) {
                        console.log("fbUserinfo", _fbUserInfo);
                        var UserData = {
                            "name": _fbUserInfo.name,
                            "email": _fbUserInfo.email,
                            "fb_id" : _fbUserInfo.id,
                            "photo": _fbUserInfo.picture.data.url,
                            "rsvps": [],
                            "events": [],
                        };
                        console.log("UserData", UserData);

                        ParseService.getUser(UserData.fb_id).then(function(result){
                            if (result.data.results.length != 0) {
                                console.log("User exists in the database")
                                return _fbUserInfo;
                            } else {
                                
                                return ParseService.addUser(UserData).then(function(success){
                                    console.log("User added", success);
                                    return success;
                                }) 
                            }
                        })
                        
                    }); 
            });
        };

        var currentUser = function() {
            $cordovaFacebook.getLoginStatus().then(function(success) {
            console.log("getLoginStatus", success);
            var accessToken = success.authResponse.accessToken;
            var userID = success.authResponse.userID;
            var expiresIn = success.authResponse.expiresIn;

            var expDate = new Date(
                new Date().getTime() + expiresIn * 1000
            ).toISOString();
                
                var fbValues = "&fields=id,name,picture,email";
            var fbPermission = ["public_profile", "email"];

            $cordovaFacebook.api("me?access_token=" + accessToken + fbValues, fbPermission)
                .then(function (_fbUserInfo) {
                    currentUser.objectId = _fbUserInfo.id;
                })
            })
            return ParseService.getUser(currentUser.objectId).then(function(success) {
                console.log("getUser", success);
                return success;
            });

        };

    return {
        login: login,
        currentUser: currentUser
    }
});

