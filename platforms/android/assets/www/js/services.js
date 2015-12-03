angular.module('app.services', [])

.factory('Camera', ['$q', function ($q) {

        return {

            getPictureFromGallery: function (options) {
                var q = $q.defer();

                navigator.camera.getPicture(function (result) {
                    // Do any magic you need
                    q.resolve(result);
                }, function (err) {
                    q.reject(err);
                }, options);

                return q.promise;
            },

            /**
             *
             * @param options
             * @returns {*}
             */
            getPicture: function (options) {
                var q = $q.defer();

                navigator.camera.getPicture(function (result) {
                    // Do any magic you need
                    q.resolve(result);
                }, function (err) {
                    q.reject(err);
                }, options);

                return q.promise;
            },
            /**
             *
             * @param img_path
             * @returns {*}
             */
            resizeImage: function (img_path) {
                var q = $q.defer();
                window.imageResizer.resizeImage(function (success_resp) {
                    console.log('success, img re-size: ' + JSON.stringify(success_resp));
                    q.resolve(success_resp);
                }, function (fail_resp) {
                    console.log('fail, img re-size: ' + JSON.stringify(fail_resp));
                    q.reject(fail_resp);
                }, img_path, 200, 0, {
                    imageDataType: ImageResizer.IMAGE_DATA_TYPE_URL,
                    resizeType: ImageResizer.RESIZE_TYPE_MIN_PIXEL,
                    pixelDensity: true,
                    storeImage: false,
                    photoAlbum: false,
                    format: 'jpg'
                });

                return q.promise;
            },

            toBase64Image: function (img_path) {
                var q = $q.defer();
                window.imageResizer.resizeImage(function (success_resp) {
                    console.log('success, img toBase64Image: ' + JSON.stringify(success_resp));
                    q.resolve(success_resp);
                }, function (fail_resp) {
                    console.log('fail, img toBase64Image: ' + JSON.stringify(fail_resp));
                    q.reject(fail_resp);
                }, img_path, 1, 1, {
                    imageDataType: ImageResizer.IMAGE_DATA_TYPE_URL,
                    resizeType: ImageResizer.RESIZE_TYPE_FACTOR,
                    format: 'jpg'
                });

                return q.promise;
            }
        }
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

        savePhotoToParse: function (_params) {

    // for POST, we only need to set the authentication header
    
    // for POST, we need to specify data to add, AND convert it to
    // a string before passing it in as separate parameter data
    var dataObject = {base64: _params.photo};

    // $http returns a promise, which has a then function
    return $http.post(baseURL + 'pictures/mypic.jpeg', dataObject, defaultSettings)
        .then(function (response) {
            // In the response resp.data contains the result
            // check the console to see all of the data returned
            console.log('savePhotoToParse', response);

            // now save to ImageObject Class
            return $http.post(baseURL + 'events/Image', {
                caption: _params.caption,
                picture: {
                    "name": response.data.name,
                    "__type": "File"
                }
            }, settings);
        }).then(function (_imageInfoResp) {
            console.log(_imageInfoResp);
            return _imageInfoResp.data;
        }, function (_error) {
            console.log("Error: ", _error);
        });
},















    	addEvent: function(eventDetails) {
            return $http.post(baseURL + '/Events', eventDetails, defaultSettings)
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
        updateUser: function(newData) {
            var params = newData;
            console.log("newData\n", newData);
            return $http.put(baseURL + "/User/" + newData.objectId, params, defaultSettings)
                .then(function(_response) {
                    console.log(_response);
                    return _response;
                });
        },
        updateEvent: function(newData) {
            var params = newData;
            console.log("newEventData\n", newData);
            return $http.put(baseURL + "/Events/" + newData.objectId, params, defaultSettings)
                .then(function(_response) {
                    console.log(_response);
                    return _response;
                });
        },
        deleteEvent: function(obj_id) {
            return $http.delete(baseURL + "/Events/" + obj_id, defaultSettings)
                .then(function(_data) {
                    console.log("event deleting\n", _data);
                    return _data;
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
    return {
        login: login,
    }
});

