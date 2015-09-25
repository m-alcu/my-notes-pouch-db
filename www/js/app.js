(function() {

var app = angular.module('mynotes', ['ionic', 'mynotes.notestore', 'UserApp', 'pouchdb']);


app.run(function($ionicPlatform, user, NoteStore) {
  // Initiate the user service with your UserApp App Id
  // https://help.userapp.io/customer/portal/articles/1322336-how-do-i-find-my-app-id-
  user.init({ appId: '55fb1d3fd5864' });
  
  user.getCurrent().then(function(currentUser) {
	window.localStorage['currentUser'] = currentUser.login;  
	console.log(currentUser.login);
	NoteStore.sync();	
  });  
  
  
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

  $scope.print = function() {
    NoteStore.print();
  };

});

app.controller('AddCtrl', function($scope, $state, NoteStore, user) {

	user.getCurrent().then(function(currentUser) {
		console.log(currentUser.login);
		
		$scope.note = {
		id: new Date().getTime().toString(),
		title: '',
		description: '',
		user: currentUser.login
		};		
	});




  $scope.save = function() {
    NoteStore.create($scope.note);
    $state.go('list');
  };
});

app.controller('EditCtrl', function($scope, $state, NoteStore) {

  $scope.note = angular.copy(NoteStore.get($state.params.noteId));

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