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

// TODO: move inside qr
function unhideToParagraph(para) {
	var counter = 0;
	// console.log("num items: " + $("#text > *").size());
	$("#text > *").each(function(index) {
		if ($(this).is('p')) {
			if (++counter == para) {
				return false;
			}
		}
		$(this).show();
		console.log("showing: " + $(this));
		// if (counter == para - 1) {
		// $("body").scrollTop($(this).position().top);
		// }
	});
}

var qr = {		

	language : "es", // null,	

	title : {
		path : "books/OL21632392M"
	}, // null,

	// section within document
	section: 1,
	// paragraph within section
	paragraph : 1,
	// 
	wordList : [],

	get : function(url) {
		return $.get(url).fail(function(jxhr, status, error) {
			alert(error);
			console.log(error);
		});
	},

	showTitle : function(path) {
		this.title.path = path;
		$.mobile.changePage("#details");
	},
	
	getBaseUrl : function() {
		return "/QuizReaderEnglish/es/"; 
	},

	getCoverUrl : function() {
		return this.getBaseUrl() + this.title.path + "/cover.html";
	},
		
	getLibraryUrl: function() {
		return this.getBaseUrl() + "idx.json";
	},
	
	getPageUrl: function() {
		return this.getBaseUrl() + this.title.path + "/t00" + this.section + ".html";
	}
};

// global init for any page
$(document).delegate("div[data-role='page']", "pageinit", function(e) {
	$(document).on("pagebeforeshow", "div[data-role='page']", function(e, data) {
		//
	});
});

// ---------------------- common methods

// check the app state and redirect if necessary
function checkState() {
	if (!qr.title.path) {
		$.mobile.changePage("#current");
		return false;
	}
	/*
	if (qr.wordList.length == 0) {
		$.mobile.changePage("#read");
		return false;
	}
*/
	return true;
}

function quizRead(paragraph) {
	var mesg = "finding words in paragraph " + paragraph;
	if ($("p:nth-of-type(" + paragraph + ")").length > 0) {
		$.mobile.loading("show", {
			text : mesg
		// textVisible: textVisible,
		});
		// grab all words for the current paragraph
		var wordMap = {};
		$("#text > p:nth-of-type(" + paragraph + ") a").each(function(index) {
			wordMap[$(this).text()] = 1;
		});
		qr.wordList = dao.getNewWords(Object.keys(wordMap));
		console.log("found " + qr.wordList.length + " unique words");
		$.mobile.changePage("#show_def");
	}
	else { // next section
		qr.section++;
		qr.paragraph = 1;
		$.mobile.changePage("#details");
	}
}

// ---------------------- splash

$(document).delegate("#splash", "pageinit", function() {
	// init for splash page
	var source = $("#splash_template").html();
	var template = Handlebars.compile(source);

	$(document).on('pagebeforeshow', '#splash', function(e, data) {
		var data = dao.getWordCounts();
		var list = $("#language_list");
		list.html(template(data)).listview("refresh");
		$("a[data-code]", list).on('click', function(e) {
			qr.language = $(this).data("code");
			$.mobile.changePage("#current");
		});
	});
});

// ---------------------- current/now reading

$(document).delegate("#current", "pageinit", function() {
	var source = $("#current_template").html();
	var template = Handlebars.compile(source);

	$(document).on('pagebeforeshow', '#current', function(e, data) {
		var data = dao.getOpenTitles();
		$("#current_list").html(template(data)).listview("refresh");
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
				data[i].sub = data[i].sub ? data[i].sub : [];
				data[i].sub.parent = data;
				this.prepare(data[i].sub);
			}
		}
	};

	function showEntry() {
		var list = $("#library_list");
		// redo list from template
		list.html(template({
			lib : lib.current,
			libpath: qr.getBaseUrl()
		})).listview("refresh");
		// add event handlers to new list items
		$("a[data-path]", list).on('click', function(e) {
			qr.showTitle($(this).data("path"));
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
		if (!qr.language) {
			$.mobile.changePage("#details");
			return;
		}
		if (lib.language != qr.language) {
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

// ------------------- details

$(document).delegate("#details", "pageinit", function() {

	$("#readButton").on('click', function(e) {
		// are we already reading this title
		if (!dao.getTitle(this.title.path)) {
			dao.addTitle(this.title.path);
		}
		$.mobile.changePage("#read");
	});

	$(document).on('pagebeforeshow', '#details', function(e, data) {
		if (checkState()) {
			$("#cover_div").load(qr.getCoverUrl());
		}
	});
});

// ------------------- reading page

$(document).delegate("#read", "pageinit", function() {

	$("#moreButton").on('click', function(e) {
		quizRead(qr.paragraph++);
	});

	$(document).on('pagebeforeshow', '#read', function(e, data) {
		if (checkState()) {		
			// qr.title.paragraph = 1;
			$("#text").load(qr.getPageUrl(), function() {
				quizRead(qr.paragraph++);
			});	
		}
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
		if (checkState()) {
			defIndex = 1;
			$("#def_div").html(template(qr.wordList[0]));
		}
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
		if (checkState()) {
			// $("#quiz_set").html(template(defList[0])).controlgroup("refresh");
			defIndex = 1;
			showQuiz(qr.wordList[0]);
		}
	});
});
