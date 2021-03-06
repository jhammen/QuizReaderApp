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
			if (event.oldVersion < 1) {
				// languages
				var languageStore = db.createObjectStore("languages", {
					keyPath : "code"
				});
				// titles
				var titleStore = db.createObjectStore("titles", {
					keyPath : "path"
				});
				titleStore.createIndex("active", "active");
				// words
				var wordStore = db.createObjectStore("words", {
					autoIncrement : true,
					keyPath : "id"
				});
				wordStore.createIndex("word", "word");
				// settings
				var settingStore = db.createObjectStore("settings");
			}
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
				cursor["continue"]();
			} else {
				callback(languages);
			}
		};
	},

	addTitle : function(title, callback) {
		var transaction = this.db.transaction("titles", "readwrite");
		var objectStore = transaction.objectStore("titles");
		title.section = 1; // section is 1-based
		title.element = 0; // element is 0-based
		title.active = true;
		var request = objectStore.add(title);
		request.onsuccess = function(event) {
			callback(title);
		};
	},

	updateTitle : function(title, callback) {
		console.log("updating title: " + title.path)
		var transaction = this.db.transaction("titles", "readwrite");
		var objectStore = transaction.objectStore("titles");
		// Do something when all the data is added to the database.
		transaction.oncomplete = function(event) {
		};
		transaction.onerror = function(event) {
			// TODO: handle errors
		};
		var request = objectStore.put(title);
		request.onsuccess = function(event) {
			callback();
		};
		request.onerror = function(event) {
			// TODO: handle errors
		};
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
				cursor["continue"]();
			} else {
				callback(titles);
			}
		};
	},

	getTitle : function(path, callback) {
		var transaction = this.db.transaction([ "titles" ]);
		var objectStore = transaction.objectStore("titles");
		objectStore.get(path).onsuccess = function(event) {
			var result = event.target.result;
			callback(result);
		};
	},

	deleteTitle : function(path, callback) {
		var transaction = this.db.transaction([ "titles" ], "readwrite");
		var objectStore = transaction.objectStore("titles");
		objectStore["delete"](path).onsuccess = function(event) {
			callback();
		};
	},

	// addWord : function(language, word, callback) {
	// var transaction = this.db.transaction("words", "readwrite");
	// var wordStore = transaction.objectStore("words");
	// var request = wordStore.add({
	// "language" : language,
	// "word" : word,
	// "level" : 0
	// });
	// request.onsuccess = function(event) {
	// return callback();
	// };
	// },

	getWordCount : function(language, callback) {
		var transaction = this.db.transaction("words", "readonly");
		var wordStore = transaction.objectStore("words");
		var count = 0;
		wordStore.openCursor().onsuccess = function(event) {
			var cursor = event.target.result;
			if (cursor) {
				if (cursor.value.language == language) {
					count++;
				}
				cursor["continue"]();
			} else {
				callback(count);
			}
		};
	},

	getWord : function(language, word, callback) {
		var transaction = this.db.transaction("words", "readonly");
		var wordStore = transaction.objectStore("words");
		var keyRange = IDBKeyRange.only(word);
		var index = wordStore.index("word");
		index.openCursor(keyRange).onsuccess = function(event) {
			var result = event.target.result;
			if (result) {
				if (result.value.language == language) {
					callback(word, result.value.level);
				} else {
					result["continue"]();
				}
			} else {
				callback(word, 0);
			}
		};
	},

	getWordAtIndex : function(index, callback) {
		var transaction = this.db.transaction("words", "readonly");
		var wordStore = transaction.objectStore("words");
		var count = 0;
		wordStore.openCursor().onsuccess = function(event) {
			var result = event.target.result;
			if (count++ == index) {
				callback(result.value.word);
			} else if (!result) {
				callback(null);
			} else {
				result["continue"]();
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
				words.push(cursor.value);
				cursor["continue"]();
			} else {
				callback(words);
			}
		};
	},

	saveWord : function(language, word, level, callback) {
		var transaction = this.db.transaction("words", "readwrite");
		var wordStore = transaction.objectStore("words");
		var keyRange = IDBKeyRange.only(word);
		var index = wordStore.index("word");
		index.openCursor(keyRange).onsuccess = function(event) {
			var cursor = event.target.result;
			if (cursor) {
				var result = cursor.value;
				if (result.language == language) {
					result.level = level;
					wordStore.put(result);
					callback();
				} else {
					cursor["continue"]();
				}
			} else {
				wordStore.put({
					"language" : language,
					"word" : word,
					"level" : level
				});
				callback();
			}
		};
	},

	deleteWord : function(id, callback) {
		var transaction = this.db.transaction("words", "readwrite");
		var wordStore = transaction.objectStore("words");
		wordStore["delete"](id).onsuccess = function(event) {
			callback();
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
			var result = event.target.result;
			if (result) {
				settings[result.key] = result.value;
				result["continue"]();
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

function getDao(callback) {
	if (indexeddao.isSupported()) {
		indexeddao.open(function() {
			callback(indexeddao);
		});
	} else {
		alert("Your browser does not support saving data, you can test the app but will not be able to save your progress");
		callback(memorydao);
	}
}
