angular.module('mynotes.notestore', ['pouchdb'])
	.factory('NoteStore', function(pouchCollection) {
		
	  var dbName = 'ionicp3';
	  var sync;
	  
      var notes = pouchCollection(dbName);
	  
//	  var notes = angular.fromJson(window.localStorage['notes'] || '[]');

	  // function persist() {
	  	// window.localStorage['notes'] = angular.toJson(notes);
	  // }

	  return {
		  
		sync: function() {
//			sync = notes.$db.replicate.sync('https://couchdb-663779.smileupps.com/' + dbName, {live: true, retry: true})
			sync = notes.$db.replicate.sync(window.localStorage['server'] + dbName, {live: true, retry: true, filter: 'app/by_user', query_params: { "user": window.localStorage['currentUser'] }})
          .on('error', function (err) {
            console.log("Syncing stopped");
            console.log(err);
          });
		},
		
	    cancel: function () {
		  sync.cancel();
	    },

	    list: function() {
	      return notes;
	    },

	    get: function(noteId) {
	      for (var i = 0; i < notes.length; i++) {
	        if (notes[i].id === noteId) {
	          return notes[i];
	        }
	      }
	      return undefined;
	    },
		
		getRemotedb: function() {
			var db = new PouchDB(window.localStorage['server'] + dbName);
			return db;
		},

	    create: function(note) {
		  notes.$add(note);
	    },

	    update: function(note) {
		  notes.$update(note);
		  console.log('updated: '+angular.toJson(notes));
		  return;
	    },

	    // move: function(note, fromIndex, toIndex) {
	    	// notes.splice(fromIndex, 1);
	    	// notes.splice(toIndex, 0, note);
	    	// persist();
	    // },

	    remove: function(note) {
//		  notes.$remove(note);
		  note._deleted = true;
		  notes.$update(note);
		  console.log('removed: '+angular.toJson(notes));
		  return;
	    }

	  };

	});
