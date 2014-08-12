/*
 This file is part of QuizReader.

 QuizReader is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 QuizReader is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with QuizReader.  If not, see <http://www.gnu.org/licenses/>.
 */

var qr = {

	dao : null,

	languages : null,

	language : null,

	current : {}, // hash of current titles

	title : null,

	// section within document
	section : 1,
	// paragraph within section
	paragraph : 1,
	// 
	wordList : [],

	getBaseUrl : function() {
		return "/library/es/";
	},

	getCoverUrl : function() {
		return this.getBaseUrl() + this.title.path + "/cover.html";
	},

	getLibraryUrl : function() {
		return this.getBaseUrl() + "idx.json";
	},

	getPageUrl : function() {
		return this.getBaseUrl() + this.title.path + "/t00" + this.section + ".html";
	}
};

// Handlebars init
Handlebars.registerHelper("libpath", function() {
	return qr.getBaseUrl();
});

// ---------------------- init methods

function checkDb(callback) {
	if (qr.dao) {
		return callback();
	}
	if (indexeddao.isSupported()) {
		qr.dao = indexeddao;
		qr.dao.open(function() {
			return callback();
		});
	} else {
		alert("Your browser does not support saving data, you can test the app but will not be able to save your progress");
		qr.dao = memorydao;
		return callback();
	}
}

function checkLanguage(callback) {
	if (qr.language) {
		return callback();
	}
	return checkDb(function() {
		qr.dao.getLanguages(function(data) {
			qr.languages = data;
			if (data.length > 1) {
				$.mobile.changePage("#language_choice");
			} else if (data.length == 0) { // no existing languages
				$.mobile.changePage("#language_add");
			} else {
				qr.language = data[0].code;
				return callback();
			}
		});
	});
}

function checkTitle(callback) {
	if (qr.title) {
		return callback();
	}
	return checkLanguage(function() {
		$.mobile.changePage("#current");
	});
}

// ---------------------- common methods

function unhideToParagraph(paragraph) {
	// unhide to paragraph
	var counter = 0;
	console.log("num top-level items in section file: " + $("#text > *").size());
	$("#text > *").each(function(index) {
		$(this).show();
		if ($(this).is('p') && ++counter == paragraph) {
			return false; // why?
		}
		// if (counter == paragraph - 1) {
		// $("body").scrollTop($(this).position().top);
		// }
	});
}

function quizRead(paragraph) {
	// check we haven't gone past the end
	if ($("p:nth-of-type(" + paragraph + ")").length > 0) {
		$.mobile.loading("show", {
			text : "finding words in paragraph " + paragraph,
			textVisible : true
		});
		// grab all words for the current paragraph
		var wordMap = {};
		$("#text > p:nth-of-type(" + paragraph + ") a").each(function(index) {
			wordMap[$(this).text()] = 1;
		});
		qr.wordList = dao.getNewWords(Object.keys(wordMap));
		console.log("found " + qr.wordList.length + " unique words");
		// unhide to paragraph in background
		setTimeout(function() {
			unhideToParagraph(paragraph);
		}, 100);
		// start showing definitions
		$.mobile.changePage("#show_def");
	} else { // next section
		alert("end of chapter " + qr.section);
		qr.section++;
		qr.paragraph = 1;
		$.mobile.loading("show", {
			text : "loading chapter " + qr.section
		});
		$("#text").load(qr.getPageUrl(), function() {
			quizRead(qr.paragraph++);
		});
	}
}

// ---------------------- language add

$(document).delegate("#language_add", "pageinit", function() {
	var source = $("#add_language_template").html();
	var template = Handlebars.compile(source);
	$(document).on('pagebeforeshow', '#language_add', function(e, data) {
		checkLanguage(function() {
			var languages = [ {
				code : "es",
				name : "Spanish"
			}, {
				code : "fr",
				name : "French"
			} ];
			// turn list into hash of new languages
			var languageHash = {};
			for(var i = 0; i < languages.length; i++) {
				var code = languages[i].code;
				languageHash[code] = languages[i];
				for(var j = 0; j < qr.languages.length; j++) {
					if(code == qr.languages[j].code) {
						languages[i].inuse = true;
					}
				}
			}
			var list = $("#add_language_list");
			list.html(template(languages)).listview("refresh");
			$("a[data-code]", list).on('click', function(e) {
				qr.language = $(this).data("code");
				qr.dao.addLanguage({
					code : qr.language,
					name : languageHash[qr.language],
					words : 0
				}, function() {
					$.mobile.changePage("#current");
				});
			});
		});
	});
});

// ---------------------- language choice

$(document).delegate("#language_choice", "pageinit", function() {
	var source = $("#language_template").html();
	var template = Handlebars.compile(source);

	$(document).on('pagebeforeshow', '#language_choice', function(e, data) {
		checkLanguage(function() {
			var list = $("#language_list");
			list.html(template(qr.languages)).listview("refresh");
			$("a[data-code]", list).on('click', function(e) {
				qr.language = $(this).data("code");
				$.mobile.changePage("#current");
			});
		});
	});
});

// ---------------------- current/now reading

$(document).delegate("#current", "pagebeforecreate", function() {
	var source = $("#current_template").html();
	var template = Handlebars.compile(source);

	$(document).on('pagebeforeshow', '#current', function(e, data) {
		checkLanguage(function() {
			qr.current = {};
			qr.dao.getOpenTitles(function(data) {
				// hash current titles
				for (var i = 0; i < data.length; i++) {
					qr.current[data[i].path] = data[i];
				}
				var list = $("#current_list");
				list.html(template(data)).listview("refresh");
				$("a[data-path]", list).on('click', function(e) {
					qr.title = qr.current[$(this).data("path")];
					$.mobile.changePage("#details");
				});
			});
		});
	});
});

// ---------------------- library

$(document).delegate("#library", "pageinit", function() {
	var source = $("#library_template").html();
	var template = Handlebars.compile(source);

	// library state
	var lib = {
		language : null,
		current : null,
		prepare : function(data) {
			for (var i = 0; i < data.length; i++) {
				if (data[i].name) {
					data[i].sub = data[i].sub ? data[i].sub : [];
					data[i].sub.parent = data;
					this.prepare(data[i].sub);
				}
			}
		}
	};

	function showEntry() {
		var list = $("#library_list");
		// redo list from template
		list.html(template({
			lib : lib.current,
			libpath : qr.getBaseUrl()
		})).listview("refresh");
		// hash titles
		var titleByPath = {};
		for (var i = 0; i < lib.current.length; i++) {
			if (lib.current[i].title) {
				titleByPath[lib.current[i].path] = lib.current[i];
			}
		}
		// add event handlers to new list items
		$("a[data-path]", list).on('click', function(e) {
			qr.title = titleByPath[$(this).data("path")];
			console.log("title hash for " + $(this).data("path"));
			console.log(qr.title);
			$.mobile.changePage("#details");
		});
		$("a[data-parent]", list).on('click', function(e) {
			lib.current = lib.current.parent;
			showEntry();
		});
		$("a[data-index]", list).on('click', function(e) {
			var index = $(this).data("index");
			lib.current = lib.current[index].sub;
			showEntry();
		});
	}

	$(document).on('pagebeforeshow', '#library', function(e, data) {
		checkLanguage(function() {
			if (lib.language != qr.language) {
				$.mobile.loading("show", {
					text : "loading library for " + qr.language,
					textVisible : true
				});
				$.getJSON(qr.getLibraryUrl()).done(function(data) {
					lib.language = qr.language;
					lib.current = data;
					lib.prepare(data);
					showEntry();
				}).fail(function(foo, mesg) {
					alert(mesg);
					console.log(foo);
				});
			}
		});
	});
});

// ------------------- details

$(document).delegate("#details", "pageinit", function() {
	$("#readButton").on('click', function(e) {
		// are we already reading this title
		if (!qr.current[qr.title.path]) {
			dao.addTitle(qr.title);
		}
		// read
		$("#text").load(qr.getPageUrl(), function() {
			quizRead(qr.paragraph++);
		});
	});

	$(document).on('pagebeforeshow', '#details', function(e, data) {
		checkTitle(function() {
			$("#cover_div").load(qr.getCoverUrl());
		});
	});
});

// ------------------- reading page

$(document).delegate("#read", "pageinit", function() {

	$("#moreButton").on('click', function(e) {
		quizRead(qr.paragraph++);
	});

	$(document).on('pagebeforeshow', '#read', function(e, data) {
		checkTitle(function() {
			//
		});
	});
});

// ------------------- definition page

$(document).delegate("#show_def", "pageinit", function() {

	var source = $("#def_template").html();
	var template = Handlebars.compile(source);

	var defIndex = 1;

	// "Next" button
	$("#nextDefButton").on('click', function(e) {
		if (defIndex < qr.wordList.length) {
			// show the next definition
			$("#def_div").html(template(qr.wordList[defIndex++]));
		} else { // we're out of definitions to show
			$.mobile.changePage("#quiz");
		}
	});

	$(document).on('pagebeforeshow', '#show_def', function(e, data) {
		checkTitle(function() {
			defIndex = 1;
			$("#def_div").html(template(qr.wordList[0]));
		});
	});
});

// ------------------- quiz page

$(document).delegate("#quiz", "pageinit", function() {

	function showQuiz(obj) {
		// show the next definition
		$("#quiz_def").text(obj.word);
		$("#quiz_answer1").text(obj.word);
		$("#quiz_answer2").text(obj.word);
		$("#quiz_answer3").text(obj.word);
	}

	var defIndex = 1;
	// "Next" button
	$("#nextQuizButton").on('click', function(e) {
		if (defIndex < qr.wordList.length) {
			showQuiz(qr.wordList[defIndex++]);
		} else { // we're done showing quizzes
			$.mobile.changePage("#read");
		}
	});

	$(document).on('pagebeforeshow', '#quiz', function(e, data) {
		checkTitle(function() {
			// $("#quiz_set").html(template(defList[0])).controlgroup("refresh");
			defIndex = 1;
			showQuiz(qr.wordList[0]);
		});
	});
});
