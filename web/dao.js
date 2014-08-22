var indexeddao = {

	db : null,

	print : function() {
		console.log("db is " + this.db)
	},

	isSupported : function() {
		return window.indexedDB;
	},

	open : function(callback) {
		var self = this;
		var request = indexedDB.open("MyTestDatabase");
		request.onerror = function(event) {
			alert("cannot open IndexedDB");
			console.log(event);
		};
		request.onupgradeneeded = function(event) {
			var db = request.result;
			var titleStore = db.createObjectStore("titles", {
				keyPath : "path"
			});
			var activeIndex = titleStore.createIndex("is_active", "active");
			var languageStore = db.createObjectStore("languages", {
				keyPath : "code"
			});
			var wordStore = db.createObjectStore("words");
		};
		request.onsuccess = function(event) {
			self.db = request.result;
			callback();
		};
	},

	addLanguage : function(language, callback) {
		var transaction = this.db.transaction("languages", "readwrite");
		var objectStore = transaction.objectStore("languages");
		var request = objectStore.add(language);
		request.onerror = function(event) {
			alert("addLanguage request failed");
		};
		request.onsuccess = function(event) {
			callback();
		};
	},

	getLanguages : function(callback) {
		var transaction = this.db.transaction([ "languages" ]);
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
			console.log("addTitle success");
		};
		transaction.onerror = function(event) {
			// TODO: handle errors
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
		// this.titles.push(name);
	},

	getOpenTitles : function(callback) {
		var transaction = this.db.transaction([ "titles" ]);
		var objectStore = transaction.objectStore("titles");
		// var index = objectStore.index("is_active");
		var titles = [];
		// index.openCursor().onsuccess = function(event) {
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
	
	addWord : function(word, callback) {
		var transaction = this.db.transaction("words", "readwrite");
		var wordStore = transaction.objectStore("words");
		var request = wordStore.add(0, word);
		request.onsuccess = function(event) {				
			return callback();
		};
	},

	getWord : function(word, callback) {
		var transaction = this.db.transaction("words", "readonly");
		var wordStore = transaction.objectStore("words");
		var request = wordStore.get(word);
		request.onsuccess = function() {
			callback(word, request.result);
		};
	},
	
	updateWord : function(word, value, callback) {
		var transaction = this.db.transaction("words", "readwrite");
		var wordStore = transaction.objectStore("words");
		var request = wordStore.put(value, word);
		request.onsuccess = function(event) {				
			return callback();
		};
	}
};

var memorydao = {

};
