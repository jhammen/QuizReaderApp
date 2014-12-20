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
		var request = window.indexedDB.open("TestFFDatabase", 2);
		request.onerror = function(event) {
			alert("cannot open IndexedDB");
			console.log(event);
		};
		request.onupgradeneeded = function(event) {
			var db = request.result;
			if(event.oldVersion < 1) {
				// languages
				var languageStore = db.createObjectStore("languages", {
					keyPath : "code"
				});
				// titles
				var titleStore = db.createObjectStore("titles", {
					keyPath : "path"
				});
				var activeIndex = titleStore.createIndex("is_active", "active");
				// words
				var wordStore = db.createObjectStore("words");
			}
			// settings
			var settingStore = db.createObjectStore("settings");
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
		title.section = 1; // section is 1-based
		title.paragraph = 0; // element is 0-based
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

	getWordCount : function(callback) {
		var transaction = this.db.transaction("words", "readonly");
		var wordStore = transaction.objectStore("words");
		var count = 0;
		wordStore.openCursor().onsuccess = function(event) {
			var result = event.target.result;
			if(result) {				
				++count;
				result.continue();
			}
			else { 
				callback(count);
			}
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
	
	getWordAtIndex : function(index, callback) {
		var transaction = this.db.transaction("words", "readonly");
		var wordStore = transaction.objectStore("words");
		var count = 0;
		wordStore.openCursor().onsuccess = function(event) {
			var result = event.target.result;
			if(count++ == index) {
				callback(result.key);
			} else if (!result) {
				callback(null);
			}
			else {
				result.continue();				
			}
		};
	},
	
	getAllWords : function(callback) {
		var transaction = this.db.transaction("words", "readonly");
		var wordStore = transaction.objectStore("words");
		var words = [];
		wordStore.openCursor().onsuccess = function(event) {
			var cursor = event.target.result;
			if (cursor) {
				words.push({"word" : cursor.key, "level" : cursor.value});
				cursor.continue();
			} else {
				callback(words);
			}
		};
	},	
	
	updateWord : function(word, value, callback) {
		var transaction = this.db.transaction("words", "readwrite");
		var wordStore = transaction.objectStore("words");
		var request = wordStore.put(value, word);
		request.onsuccess = function(event) {				
			return callback();
		};
	},
	
	saveSetting : function(setting, value, callback) {
		var transaction = this.db.transaction("settings", "readwrite");
		var settingStore = transaction.objectStore("settings");
		var request = settingStore.put(value, setting);
		request.onsuccess = function(event) {				
			callback();
		};
	},
	
	getAllSettings : function(callback) {
		var transaction = this.db.transaction("settings", "readonly");
		var settingsStore = transaction.objectStore("settings");
		var settings = {};
		settingsStore.openCursor().onsuccess = function(event) {
			var cursor = event.target.result;
			if (cursor) {
				settings[cursor.key] = cursor.value;
				cursor.continue();
			} else {
				callback(settings);
			}
		};
	},		
};

var memorydao = {
		languages : [],
		
		titles : [],
		
		level : {},
		
		addLanguage : function(language, callback) {
			this.languages.push(language);
			callback();
		},

		getLanguages : function(callback) {
			callback(this.languages);
		},
		
		addTitle : function(title) {
			this.titles.push(title);
		},		
		
		getOpenTitles : function(callback) {			
			callback(this.titles);
		},
		
		addWord : function(word, callback) {
			this.level[word] = 0;
			return callback();
		},

		getWord : function(word, callback) {
			callback(word, this.level[word]);
		},
		
		updateWord : function(word, value, callback) {
			this.level[word] = value;
			return callback();
		}
};
