var dao = {

	db: null,

	print : function() { console.log("db is " + this.db) },

	supported: function() { return window.indexedDB; },

	init : function(callback) {		
		var self = this;
		var request = indexedDB.open("MyTestDatabase3", 2);		
		request.onerror = function(event) {
		  alert("cannot open IndexedDB");
		  console.log(event);
		};
		request.onupgradeneeded = function(event) {		
		  var db = request.result;
		if(event.oldVersion < 1) {
		  var titleStore = db.createObjectStore("titles", {keyPath: "path"});
		  var activeIndex = titleStore.createIndex("is_active", "active");
		}
		if (event.oldVersion < 2) {
		  var languageStore = db.createObjectStore("languages", {keyPath: "code"});
		}
			// debug
			
		};
		request.onsuccess = function(event) {
		  self.db = request.result;
		  callback();
		};
	},

	addLanguage : function(language) {		
		var transaction = this.db.transaction("languages", "readwrite");
		var objectStore = transaction.objectStore("languages");	
		var request = objectStore.add(language);
		request.onerror = function(event) {
			alert("addLanguage request failed");
		};
	},

	getLanguages : function(callback) {
		var transaction = this.db.transaction(["languages"]);
		var objectStore = transaction.objectStore("languages");
		var languages = [];		
		objectStore.openCursor().onsuccess = function(event) {
		  var cursor = event.target.result;
		  if (cursor) {		
			languages.push(cursor.value);
			cursor.continue();
		  } else {
			console.log("found languages: " + languages.length);
			console.log(languages);
			callback(languages);
		  }
		};
	},

	addTitle : function(title) {
		console.log("adding title: " + title.title)
		var transaction = this.db.transaction("titles", "readwrite");
		var objectStore = transaction.objectStore("titles");
		// Do something when all the data is added to the database.
		transaction.oncomplete = function(event) {
		  alert("All done!");
		};
		transaction.onerror = function(event) {
		  // Don't forget to handle errors!
		};
		title.section = 1;
		title.paragraph = 1;		
		title.active = true;
		var request = objectStore.add(title);
		request.onsuccess = function(event) {
			alert("request success");
		};
		request.onerror = function(event) {
			alert("request error");
		};
		//this.titles.push(name);
	},

	getOpenTitles : function(callback) {
		var transaction = this.db.transaction(["titles"]);
		var objectStore = transaction.objectStore("titles");
		//var index = objectStore.index("is_active");
		var titles = [];		
		//index.openCursor().onsuccess = function(event) {
		objectStore.openCursor().onsuccess = function(event) {
		  var cursor = event.target.result;
		  if (cursor) {		
			titles.push(cursor.value);
			cursor.continue();
		  } else {
			console.log("found titles: " + titles.length);
			console.log(titles);
			callback(titles);
		  }
		};		
	},

	getNewWords: function(wordList) {
		if(wordList.length < 3)
			alert("wordlist too short!!!");
		return  [ {
		word : wordList[0]
	}, {
		word : wordList[1]
	}, {
		word : wordList[2]
	} ]
	}

};
