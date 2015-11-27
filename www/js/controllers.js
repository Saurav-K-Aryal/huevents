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
   
.controller('addEventCtrl', function($scope, $state, $ionicPopup, ParseService) {
	var name = $scope.eventName;
	var description= $scope.eventDescription;
	var venue = $scope.eventVenue;
	var date = $scope.eventDate; 
	var time = $scope.eventTime;
	var image = $scope.eventImage;
	var category = $scope.eventCategory;
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
 