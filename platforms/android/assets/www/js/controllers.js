angular.module('app.controllers', [])
  
.controller('hUEventsCtrl', function($scope, $state, FacebookAuth) {
    $scope.login = function () {
      FacebookAuth.login().then(function(success) {
	    	$state.go("tabsController.allEvents");
	    }, function (error) {
	      console.log("login error\n", error);
	    });
	}
})
   


.controller('allEventsCtrl', function($scope, ParseService) {
	ParseService.getAllEvents().then(function(response) {
		// sending out the latest event post at the top.
		$scope.events = response.data.results.reverse();
	})
})
   


.controller('addEventCtrl', function($scope, $state, Camera, $cordovaFacebook, $ionicPopup, ParseService) {





     $scope.makeThumbNail = function () {
      console.log("making thumbnail")

                if (!$scope.lastPhoto) {
                    alert("Event added without photo");
                    return;
                }

                Camera.resizeImage($scope.lastPhoto).then(function (_result) {
                    $scope.thumb = "data:image/jpeg;base64," + _result.imageData;
                    $scope.savePhotoToParse();
                }, function (_error) {
                    console.log(_error);
                });
            };

            /**
             * save image to parse
             */
            $scope.savePhotoToParse = function () {
              console.log("savingpic to parse");

                if (!$scope.lastPhoto) {
                    alert("Missing Photo");
                    return;
                }


                Camera.toBase64Image($scope.lastPhoto).then(function (_result) {
                    var base64 = _result.imageData;

                    // make sure we are logged in
                    // ParseService.loginDefaultUser("admin", "password").then(function (_user) {
                    //     // user is logged in, now save to parse
                    //     return 
                        ParseService.savePhotoToParse({
                            photo: base64,
                            caption: "By User "
                        })

                    .then(function (_savePhotoResult) {
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







$scope.resize = function(imageURI){

Camera.resizeImage(imageURI).then(function (_result) {
                    $scope.thumb = "data:image/jpeg;base64," + _result.imageData;
                    //$scope.savePhotoToParse();
                }, function (_error) {
                    console.log(_error);
                });

}






















	var name = $scope.eventName;
	var description= $scope.eventDescription;
	var venue = $scope.eventVenue;
	var date = $scope.eventDate; 
	var time = $scope.eventTime;
	var image = $scope.eventImage;
	var category = $scope.eventCategory;
	var EventId = "";
	$scope.postEvent = function(name, description, venue, date, time, image, category)
	{
		if (name && description && venue && date && time && category && $scope.lastPhoto)
		{	
      console.log("one");

      Camera.resizeImage($scope.lastPhoto).then(function (_result) {
                    $scope.thumb = "data:image/jpeg;base64," + _result.imageData;
                    //$scope.savePhotoToParse();
                }, function (_error) {
                    console.log(_error);
                });

      console.log("two");

      Camera.toBase64Image($scope.lastPhoto).then(function (_result) {
                    console.log("result" + _result);
                    $scope.base64 = _result.imageData;
                    console.log("success yaha samma");
                  });

      console.log("three");

       ParseService.savePhotoToParse({
                            photo: base64,
                            caption: "By User "
                        });

       console.log("four");









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
				console.log("added Event....", response);
				var eventID = response.objectId;
                var alertPopup = $ionicPopup.alert({
     			title: 'Event Added!',
     			template: 'Your Event should show up in the events feed.',
   			});
		    alertPopup.then(function(res) {
		    $cordovaFacebook.getLoginStatus().then(function(success) {
				var userID = success.authResponse.userID;
				ParseService.getUser(userID).then(function(success) {
    				var newData = success.data.results[0];
    				newData.events.push(eventID);
    				ParseService.updateUser(newData).then(function(success){
					console.log("eventAdded to userdata\n", success);
						});
    				});	
				});
		   		});
        	});
			$state.go('tabsController.allEvents');
		}
		else
		{
			var alertPopup = $ionicPopup.alert({
     			title: 'Empty Fields!',
     			template: 'Please make sure all fields are filled.'
   			});
		    alertPopup.then(function(res) {
		   });
		}	

	}

})
   


.controller('searchEventsCtrl', function($scope, ParseService) {
	var searchResult = [];
	$scope.getQuery = function(searchQuery) {
		if (searchQuery != '')
		{
		ParseService.getAllEvents().then(function(success)
		{
			var allEvents = success.data.results.reverse()
			for (var i = 0; i < allEvents.length; i++)
			{
				var eventName = allEvents[i].name;
				var found = eventName.search(searchQuery)
				if (found != -1)
				{
					searchResult.push(allEvents[i])
				}
			}
			$scope.result = searchResult;
		});
		}
	}
})

.controller('eventEditsCtrl', function($scope, $state, ParseService, $ionicPopup, $cordovaFacebook) {
	var eventID = $state.params.objectID;
	var eventDetails = null;
	$scope.addReply = "";
	var reply = "";
	ParseService.getEventbyID(eventID).then(function (_data) {
            $scope.eventbyId = _data;
            eventDetails = _data;
            $scope.comments = _data.comments.reverse();
			$scope.replies = _data.replies.reverse();
			console.log("comments\n", $scope.comments);
			console.log("replies\n", $scope.replies);
        }, function (_error) {
            console.log("Error", error);
        });
    $scope.updateReply = function(newReply)
    {
	$scope.addReply = newReply;
	reply = newReply;
    }
	$scope.postReply = function() {
		var confirmPopup = $ionicPopup.confirm({
     		title: 'Replying..',
     		template: 'Are you sure you reply?'
   		});
   		confirmPopup.then(function(res) {
     		if(res) {
     			console.log("reply value= ", $scope.addReply);
				eventDetails.replies.push(reply);
				$scope.comments = eventDetails.comments.reverse();
				$scope.replies = eventDetails.replies.reverse();
				console.log("replies added\n",eventDetails);
     			return ParseService.updateEvent(eventDetails).then(function(success) {
    				console.log("updated events replies");
    				});
     			var alertPopup = $ionicPopup.alert({
     			title: 'Sent!',
     			template: 'Thanking you replying!'
   				});
		    	alertPopup.then(function(res) {
		   		});
			}
		});
   	}
   	$scope.editEvent = function(obj_id, name, description, venue, date, time, image, category)
   	{
   		if (name, description, venue, date, time, image, category) {
      var confirmPopup = $ionicPopup.confirm({
     		title: 'Updating the Event..',
     		template: 'All previous data will be repalced by the new fields?'
   		});
   		confirmPopup.then(function(res) {
   			if(res){
   				return ParseService.getEventbyID(obj_id).then(function(success) {
   					var eventData = success;
   					eventData.name = name;
   					eventData.description =description;
   					eventData.venue = venue;
   					eventData.date = date;
   					eventData.time = time;
   					eventData.image = image;
   					eventData.category = category;
   					return ParseService.updateEvent(eventData).then(function(_data) {
   						console.log("event updated\n", eventData);
   					});
   				});
   			}
   		});
   	} else
    {
      var alertPopup = $ionicPopup.alert({
          title: 'Empty Fields!',
          template: 'Please make sure all fields are filled.'
        });
        alertPopup.then(function(res) {
       });     
    }
  }

   	$scope.deleteEvent = function(obj_id)
   	{
   		var confirmPopup = $ionicPopup.confirm({
   			title: 'Deleting Event',
   			template: 'All history and detials of the event will be lost!'
   		});
   		confirmPopup.then(function(res) {
   			if(res){
   				return ParseService.getEventbyID(obj_id).then(function(success){
   					var eventData = success;
   					var userList = eventData.rsvps;
   					for (i=0; i < userList.length; i++)
   					{
   						return ParseService.getUser(userList[i].fb_id).then(function(_data) {
   							var userData = _data.data.results[0];
   							var index = userData.rsvps.indexOf(obj_id);
   							if (index !== -1)
   							{
   								userData.rsvps.splice(index, 1);
   							}
   							return ParseService.updateUser(userData).then(function(_response) {
   								console.log('rsvps removed from user\n', _response);
   								return ParseService.deleteEvent(obj_id).then(function(_data) {
   								console.log("event removed\n", _data);
   							$cordovaFacebook.getLoginStatus().then(function(success) {
							console.log("getLoginStatus", success);
							var userID = success.authResponse.userID;
							return ParseService.getUser(userID).then(function(success) {
    							console.log("gotUser", success);
    							var userDetails = success.data.results[0];
    							var index = userDetails.events.indexOf(obj_id);
   								if (index !== -1)
   								{
   									userDetails.events.splice(index, 1);
   								}
   								return ParseService.updateUser(userDetails).then(function(_response) {
   									console.log('events removed from user\n', _response);
   									$state.go("tabsController.myProfile");
   								})
    						});
   						});
   							})
   							})	
   						})
   					}
   				})
   			}
   		});
	}
})
      


.controller('myProfileCtrl', function($scope, $cordovaFacebook, ParseService) {	
	var rsvpList = [];
	var rsvps = [];
	var eventList = [];
	var events = [];
  var rsvp = [];
	$cordovaFacebook.getLoginStatus().then(function(success) {
		console.log("getLoginStatus", success);
		var rsvpList = [];
		var userID = success.authResponse.userID;
		return ParseService.getUser(userID).then(function(success) {
    			console.log("gotUser", success);
    			$scope.userDetails = success.data.results[0];
    	});
	});
	$scope.GetmyEvents = function(eventList) {
			$scope.rsvps = [];
			for (var i=0; i < eventList.length; i++) {
				ParseService.getEventbyID(eventList[i]).then(function(success) {
					events.push(success);
				})
			};
			$scope.myevents = events;
      events = [];
	};

  $scope.GetRsvps = function(rsvpList) {
    $scope.myevents = [];
    for (var i = 0; i < rsvpList.length; i++) {
      ParseService.getEventbyID(rsvpList[i]).then(function(_success) {
        rsvp.push(_success);
      })
    };
    $scope.rsvps = rsvp;
    rsvp = [];
  }
})
   


.controller('searchResultsCtrl', function($scope, $state, ParseService) {
	ParseService.getEventsbyCategory($state.params.category).then(function(response) {
		// sending out the latest event post at the top.
		$scope.events = response.data.results.reverse();
	})
})
   


.controller('eventDetailsCtrl', function($scope, $state, $cordovaFacebook, ParseService, $ionicPopup) {
	// doRsvp() currently only goes through popup logic will involve sending user data to organziers later.
	var eventID = $state.params.objectID;
	var eventDetails = null;
	$scope.addComment = "";
	ParseService.getEventbyID(eventID).then(function (_data) {
            $scope.eventbyId = _data;
            eventDetails = _data;
            $scope.comments = _data.comments.reverse();
			$scope.replies = _data.replies.reverse();
        }, function (_error) {
            console.log("Error", error);
        });
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
		   });
		$cordovaFacebook.getLoginStatus().then(function(success) {
			console.log("getLoginStatus", success);
			var userID = success.authResponse.userID;
			return ParseService.getUser(userID).then(function(success) {
    			console.log("gotUser", success);
    			var userDetails = success.data.results[0];
    			console.log("rsvp-ing", userDetails);
    			userDetails.rsvps.push(eventID);
    			console.log("user rsvp'd\n", userDetails);
    			eventDetails.rsvps.push(userDetails);
    			console.log("event updated\n", eventDetails);
    			return ParseService.updateEvent(eventDetails).then(function(success) {
    				console.log("updated events rsvps");
    				return ParseService.updateUser(userDetails).then(function(success) {
    				console.log("updated user's RSVP");
    		})
    				})
    			
	});
       
     });

   };
       $state.go('tabsController.allEvents');
});

};
	var comment = "";
    $scope.updateComment = function(newComment)
    {
	$scope.addComment = newComment;
	comment = newComment;
    }

	$scope.postComment = function() {
		var confirmPopup = $ionicPopup.confirm({
     		title: 'Commenting..',
     		template: 'Are you sure you Comment?'
   		});
   		confirmPopup.then(function(res) {
     		if(res) {
     			console.log("comment value= ", $scope.addComment);
				eventDetails.comments.push(comment);
				$scope.comments = eventDetails.comments.reverse();
				$scope.replies = eventDetails.replies.reverse();
				console.log("comments added\n",eventDetails);
     			return ParseService.updateEvent(eventDetails).then(function(success) {
    				console.log("updated events comments");
    				});
     			var alertPopup = $ionicPopup.alert({
     			title: 'Sent!',
     			template: 'Thanking you reaching out!'
   				});
		    	alertPopup.then(function(res) {
		   		});

			}
		});
   	}
})

.controller('rsvpDetailsCtrl', function($scope, $state, $cordovaFacebook, ParseService, $ionicPopup) {
  var eventID = $state.params.objectID;
  var eventDetails = null;
  $scope.addComment = "";
  ParseService.getEventbyID(eventID).then(function (_data) {
            $scope.eventbyId = _data;
            eventDetails = _data;
            $scope.comments = _data.comments.reverse();
            $scope.replies = _data.replies.reverse();
        }, function (_error) {
            console.log("Error", error);
        });
  var comment = "";
    $scope.updateComment = function(newComment)
    {
  $scope.addComment = newComment;
  comment = newComment;
    }

  $scope.postComment = function() {
    var confirmPopup = $ionicPopup.confirm({
        title: 'Commenting..',
        template: 'Are you sure you Comment?'
      });
      confirmPopup.then(function(res) {
        if(res) {
          console.log("comment value= ", $scope.addComment);
        eventDetails.comments.push(comment);
        $scope.comments = eventDetails.comments.reverse();
        $scope.replies = eventDetails.replies.reverse();
        console.log("comments added\n",eventDetails);
          return ParseService.updateEvent(eventDetails).then(function(success) {
            console.log("updated events comments");
            });
          var alertPopup = $ionicPopup.alert({
          title: 'Sent!',
          template: 'Thanking you reaching out!'
          });
          alertPopup.then(function(res) {
          });

      }
    });
}
    $scope.undoRsvp = function()
  { 
      var confirmPopup = $ionicPopup.confirm({
        title: 'Unregistering..',
        template: 'Are you sure you unregister to this event?'
      });
      confirmPopup.then(function(res) {
        if(res) {
          var alertPopup = $ionicPopup.alert({
          title: 'Signed up!',
          template: 'Thanking you for successfully Rsvp-ing to this event.'
        });
          alertPopup.then(function(res) {
       });
    $cordovaFacebook.getLoginStatus().then(function(success) {
      console.log("getLoginStatus", success);
      var userID = success.authResponse.userID;
      return ParseService.getUser(userID).then(function(success) {
          console.log("gotUser", success);
          var userDetails = success.data.results[0];
          var index = userDetails.rsvps.indexOf(eventID);
          if (index != -1)
          {
            userDetails.rsvps.splice(index, 1);
          }
          console.log("unrsvp-ing user\n", userDetails);
          for (var i = 0; i < eventDetails.rsvps.length; i++){
            if (eventDetails.rsvps[i].fb_id == userDetails.fb_id)
            {
              console.log('remove');
              eventDetails.rsvps.splice(i, 1);
              break;
            }
          }
          console.log("event updated\n", eventDetails);
          return ParseService.updateEvent(eventDetails).then(function(success) {
            console.log("updated events rsvps");
            return ParseService.updateUser(userDetails).then(function(success) {
            console.log("updated user's RSVP");
        })
            })
          
  })
  })
}
})
}
 });
