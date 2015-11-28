angular.module('app.controllers', [])
  
.controller('hUEventsCtrl', function($scope, $state, FacebookAuth) {
    $scope.login = function () {
      FacebookAuth.login().then(function(success) {
	    	console.log(success);
	    	$state.go("tabsController.allEvents");
	    }, function (error) {
	      console.log("login error\n", error);
	    });
	}
})
   
.controller('allEventsCtrl', function($scope, ParseService) {
	ParseService.getAllEvents().then(function(response) {
		console.log('getAllEvents', response.data.results)
		// sending out the latest event post at the top.
		$scope.events = response.data.results.reverse();
	})
})
   
.controller('addEventCtrl', function($scope, $state, camera, $ionicPopup, ParseService) {

	 $scope.makeThumbNail = function () {

                if (!$scope.lastPhoto) {
                    alert(" Missing Photo");
                    return;
                }

                Camera.resizeImage($scope.lastPhoto).then(function (_result) {
                    $scope.thumb = "data:image/jpeg;base64," + _result.imageData;
                    $scope.savePhotoToParse();
                }, function (_error) {
                    console.log(_error);
                });
            };

           
            $scope.savePhotoToParse = function () {

                if (!$scope.lastPhoto) {
                    alert(" Missing Photo ");
                    return;
                }


                Camera.toBase64Image($scope.lastPhoto).then(function (_result) {
                    var base64 = _result.imageData;

                    // make sure we are logged in
                    ParseService.loginDefaultUser("admin", "password").then(function (_user) {
                        // user is logged in, now save to parse
                        return ParseService.savePhotoToParse({
                            photo: base64,
                            caption: "By User " + _user.get("username")
                        });

                    }).then(function (_savePhotoResult) {
                        console.log("savePhotoToParse ", _savePhotoResult);

                    }, function (_error) {
                        console.log(_error);
                        alert("savePhotoToParse " + JSON.stringify(_error, null, 2));
                    });
                });
            };

            /**
             * display alert to choose where to get the image from
             */
            $scope.getPhoto = function () {
                var options = {
                    'buttonLabels': ['Take Picture', 'Select From Gallery'],
                    'addCancelButtonWithLabel': 'Cancel'
                };
                window.plugins.actionsheet.show(options, callback);
            };

            function callback(buttonIndex) {
                console.log(buttonIndex);
                if (buttonIndex === 1) {

                    var picOptions = {
                        destinationType: navigator.camera.DestinationType.FILE_URI,
                        quality: 75,
                        targetWidth: 500,
                        targetHeight: 500,
                        allowEdit: true,
                        saveToPhotoAlbum: false
                    };


                    Camera.getPicture(picOptions).then(function (imageURI) {
                        console.log(imageURI);
                        $scope.lastPhoto = imageURI;
                        $scope.newPhoto = true;

                    }, function (err) {
                        console.log(err);
                        $scope.newPhoto = false;
                        alert(err);
                    });
                } else if (buttonIndex === 2) {

                    var picOptions = {
                        destinationType: navigator.camera.DestinationType.FILE_URI,
                        quality: 75,
                        targetWidth: 500,
                        targetHeight: 500,
                        sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
                    };


                    Camera.getPictureFromGallery(picOptions).then(function (imageURI) {
                        console.log(imageURI);
                        $scope.lastPhoto = imageURI;
                        $scope.newPhoto = true;

                    }, function (err) {
                        console.log(err);
                        $scope.newPhoto = false;
                        alert(err);
                    });
                }

            };

















	var name = $scope.eventName;
	var description= $scope.eventDescription;
	var venue = $scope.eventVenue;
	var date = $scope.eventDate; 
	var time = $scope.eventTime;
	var image = $scope.eventImage;
	var category = $scope.eventCategory;
	$scope.postEvent = function(name, description, venue, date, time, image, category)
	{
		$scope.makeThumbNail();
		if (name && description && venue && date && time && category)
		{	
			var event = {
				name: name,
				description: description,
				venue: venue,
				date: date,
				time: time,
				category: category,
				image: null,
				comments: [],
				replies: [],
				rsvps: [],
			};
			ParseService.addEvent(event).then(function (response) {
                console.log('addStuff', response);
                var alertPopup = $ionicPopup.alert({
     			title: 'Event Added!',
     			template: 'Your Event should show up in the events feed.',
   			});
		    alertPopup.then(function(res) {
		     $state.go('tabsController.allEvents');
		     console.log('Thank you for adding an event.');
		   });
            });

		}
		else
		{
			var alertPopup = $ionicPopup.alert({
     			title: 'Empty Fields!',
     			template: 'Please make sure all fields are filled.'
   			});
		    alertPopup.then(function(res) {
		     console.log('Thank you for filling all fields!');
		   });
		}	

	}

})
   
.controller('searchEventsCtrl', function($scope) {

})
      
.controller('myProfileCtrl', function($scope) {

})
   
.controller('searchResultsCtrl', function($scope, $state, ParseService) {
	ParseService.getEventsbyCategory($state.params.category).then(function(response) {
		console.log('getEventsbyCategory', response.data.results);
		// sending out the latest event post at the top.
		$scope.events = response.data.results;
	})
})
   
.controller('eventDetailsCtrl', function($scope, $state, ParseService, $ionicPopup) {
	// doRsvp() currently only goes through popup logic will involve sending user data to organziers later.
	$scope.doRsvp = function()
	{	
   		var confirmPopup = $ionicPopup.confirm({
     		title: 'RSVP-ing',
     		template: 'Are you sure you RSVP to this event?'
   });
   confirmPopup.then(function(res) {
     if(res) {
     	var alertPopup = $ionicPopup.alert({
     			title: 'Signed up!',
     			template: 'Thanking you for successfully Rsvp-ing to this event.'
   			});
		    alertPopup.then(function(res) {
		     console.log('Thank you for filling all fields!');
		   });
       
     }
    $state.go('tabsController.allEvents');
   });
}

	 ParseService.getEventbyID($state.params.objectID).then(function (_data) {
            console.log(_data); //debug
            $scope.eventbyId = _data;
        }, function (_error) {
            console.log("Error");
        });

})
 