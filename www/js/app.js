(function() {

var app = angular.module('mynotes', ['ionic', 'mynotes.notestore', 'UserApp', 'pouchdb', 'ngCordova', 'angularMoment']);


app.run(function($ionicPlatform, user, NoteStore, amMoment) {
  // Initiate the user service with your UserApp App Id
  // https://help.userapp.io/customer/portal/articles/1322336-how-do-i-find-my-app-id-
  user.init({ appId: '55fb1d3fd5864' });
  
  user.getCurrent().then(function(currentUser) {
	window.localStorage['currentUser'] = currentUser.login;  
	console.log(currentUser.login);
	NoteStore.sync();	
  });  
  
  amMoment.changeLocale('es');
  
  
  $ionicPlatform.ready(function() {
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

app.config(function($stateProvider, $urlRouterProvider) {

	// the login with facebook route
	$stateProvider.state('login-facebook', {
	  url: '/login-facebook',
	  templateUrl: 'templates/login-facebook.html',
	  data: {
		login: true
	  }
	})

	// the login route
	$stateProvider.state('login', {
	  url: '/login',
	  templateUrl: 'templates/login.html',
	  data: {
		public: true
	  }
	})

	// the signup route
	$stateProvider.state('signup', {
	  url: '/signup',
	  templateUrl: 'templates/signup.html',
	  data: {
		public: true
	  }
	})



  $stateProvider.state('list', {
    url: '/list',
    templateUrl: 'templates/list.html'
  });

  $stateProvider.state('add', {
    url: '/add',
    templateUrl: 'templates/edit.html',
    controller: 'AddCtrl'
  });

  $stateProvider.state('edit', {
    url: '/edit/:noteId',
    templateUrl: 'templates/edit.html',
    controller: 'EditCtrl'
  });

  $urlRouterProvider.otherwise('/list');
});

app.controller('ListCtrl', function($scope, NoteStore, pouchCollection, user) {

  // $scope.reordering = false;
  $scope.notes = NoteStore.list();

  $scope.remove = function(noteId) {
    NoteStore.remove(noteId);
  };

  $scope.move = function(note, fromIndex, toIndex) {
    NoteStore.move(note, fromIndex, toIndex);
  };

});

app.controller('AddCtrl', function($scope, $state, NoteStore, user, $cordovaCamera, $cordovaImagePicker, $cordovaFile) {

	user.getCurrent().then(function(currentUser) {
		console.log(currentUser.login);
		
		$scope.note = {
		id: new Date().getTime().toString(),
		title: '',
		description: '',
		user: currentUser.login
		};		
	});

	$scope.pictureUrl = 'http://placehold.it/300x300';

	$scope.takePicture = function() {
		var options = {
			destinationType: Camera.DestinationType.DATA_URL,
			encodingType: Camera.EncodingType.JPEG,
			targetWidth: 1024,
			targetHeight: 1024		
		}
		$cordovaCamera.getPicture(options)
			.then(function(data) {
				//console.log('camera data: ' + angular.toJson(data));
				$scope.pictureUrl = 'data:image/jpeg;base64,' + data;

				// var attachment = {
				// content_type: 'image/jpeg',
				// data: data
				// };
				var attachments = {
					filename: {
					content_type: 'image/jpeg',
					data: data
					}
				};
				$scope.note._attachments = attachments;
			}, function(error) {
				console.log('camera error: ' + angular.toJson(error));
			});
	};  

	$scope.pickPicture = function () {

	  var options = {
	   maximumImagesCount: 1,
	   width: 1024,
	   height: 1024,
	   quality: 80
	  };
	  
	  $cordovaImagePicker.getPictures(options)
		.then(function (data) {
		  for (var i = 0; i < 1; i++) {
			console.log('Image URI: ' + data[i].split('\/').pop());
			console.log('pre: '+cordova.file.cacheDirectory);
			    // READ
			var file = data[i];
			$cordovaFile.readAsDataURL(data[i].substring(0, file.indexOf(file.split('\/').pop())), file.split('\/').pop())
			  .then(function (result) {
					console.log('Image data: ' + result);
					$scope.pictureUrl = result;
					
					var attachments = {
						filename: {
						content_type: 'image/jpeg',
						data: result.split(",")[1]
						}
					};
					$scope.note._attachments = attachments;
			  }, function (error) {
				console.log('file error: ' + angular.toJson(error));
			});

		  }
		}, function(error) {
		  console.log('pick images error: ' + angular.toJson(error));
		});
		
	};

  $scope.save = function() {
    NoteStore.create($scope.note);
    $state.go('list');
  };
});

app.controller('EditCtrl', function($scope, $state, NoteStore, $cordovaCamera, $cordovaImagePicker, $cordovaFile) {

	$scope.note = angular.copy(NoteStore.get($state.params.noteId));

	if ($scope.note._attachments == undefined) {
		$scope.pictureUrl = 'http://placehold.it/300x300';
	} else {
		var db = NoteStore.getRemotedb();
		db.get($scope.note._id, {attachments: true}).then(function (doc) {
//		  console.log(angular.toJson(doc));
			$scope.$apply(function () {
				$scope.pictureUrl = 'data:image/jpeg;base64,' + doc._attachments.filename.data;
			});
		});
		
	}

	$scope.takePicture = function() {
		var options = {
			destinationType: Camera.DestinationType.DATA_URL,
			encodingType: Camera.EncodingType.JPEG,
			targetWidth: 1024,
			targetHeight: 1024
		}
		$cordovaCamera.getPicture(options)
			.then(function(data) {
				//console.log('camera data: ' + angular.toJson(data));
				$scope.pictureUrl = 'data:image/jpeg;base64,' + data;

				// var attachment = {
				// content_type: 'image/jpeg',
				// data: data
				// };
				var attachments = {
					filename: {
					content_type: 'image/jpeg',
					data: data
					}
				};
				$scope.note._attachments = attachments;
			}, function(error) {
				console.log('camera error: ' + angular.toJson(error));
			});
	};

	$scope.pickPicture = function () {

		  var options = {
		   maximumImagesCount: 1,
		   width: 1024,
		   height: 1024,
		   quality: 80
		  };
	  
	  $cordovaImagePicker.getPictures(options)
		.then(function (data) {
		  for (var i = 0; i < 1; i++) {
			console.log('Image URI: ' + data[i].split('\/').pop());
			console.log('pre: '+cordova.file.cacheDirectory);
			    // READ
			var file = data[i];
			$cordovaFile.readAsDataURL(data[i].substring(0, file.indexOf(file.split('\/').pop())), file.split('\/').pop())
			  .then(function (result) {
					console.log('Image data: ' + result);
					$scope.pictureUrl = result;
					
					var attachments = {
						filename: {
						content_type: 'image/jpeg',
						data: result.split(",")[1]
						}
					};
					$scope.note._attachments = attachments;
			  }, function (error) {
				console.log('file error: ' + angular.toJson(error));
			});

		  }
		}, function(error) {
		  console.log('pick images error: ' + angular.toJson(error));
		});
		
	};
  
  
  $scope.save = function() {
    NoteStore.update($scope.note);
    $state.go('list');
  };
});

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

}());