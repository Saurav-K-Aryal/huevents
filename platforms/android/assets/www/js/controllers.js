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
   


.controller('addEventCtrl', function($scope, $state, $cordovaFacebook, $ionicPopup, ParseService) {
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
})
      


.controller('myProfileCtrl', function($scope, $cordovaFacebook, ParseService) {	
	var rsvpList = [];
	var rsvps = [];
	var eventList = [];
	var events = []
	$cordovaFacebook.getLoginStatus().then(function(success) {
		console.log("getLoginStatus", success);
		var rsvpList = [];
		var userID = success.authResponse.userID;
		return ParseService.getUser(userID).then(function(success) {
    			console.log("gotUser", success);
    			$scope.userDetails = success.data.results[0];
    			rsvpList = success.data.results[0].rsvps;
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
});
 