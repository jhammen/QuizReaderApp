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

	paragraph : 0,

	get : function(url) {
		return $.get(url).fail(function(jxhr, status, error) {
			alert(error);
			console.log(error);
		});
	},

	showMessage : function(mesg) {
		console.log(mesg);
	},
	
	showCurrent : function(code) {
		this.language = code;
		$.mobile.changePage("#current");
	},

	showTitle : function(path) {
		this.title.path = path;
		$.mobile.changePage("#details");
	},

	getCoverUrl : function() {
		return "/library/" + this.language + '/' + this.title.path + "/cover.html";
	},

	readTitle : function() {
		// are we already reading this title
		if (!dao.getTitle(this.title.path)) {
			dao.addTitle(this.title.path);
		}
		$.mobile.changePage("#read");
	},	

	quizRead : function() {
		// grab all words for the current paragraph
		this.showMessage("finding words in paragraph " + this.title.paragraph);
		var wordMap = {};
		$("#text > p:nth-of-type(" + this.title.paragraph + ") a").each(function(index) {
			wordMap[$(this).text()] = 1;
		});
		var wordList = Object.keys(wordMap);
		this.showMessage("found " + wordList.length + " unique words");
	},

	loadTitle : function() {
		// alert(this.docpath + "/t001.html");
		this.title.paragraph = 1;
		$("#text").load("/library/es/" + this.title.path + "/t001.html", function() {
			qr.quizRead();
		});
	}
};

// global init for any page
$(document).delegate("div[data-role='page']", "pageinit", function(e) {
	$(document).on("pagebeforeshow", "div[data-role='page']", function(e, data) {
		//
	});
});

$(document).delegate("#splash", "pageinit", function() {
	// init for splash page
	var source = $("#splash_template").html();
	var template = Handlebars.compile(source);

	$(document).on('pagebeforeshow', '#splash', function(e, data) {
		var data = dao.getWordCounts();
		var list = $("#language_list");
		list.html(template(data)).listview("refresh");
		$("a[data-code]", list).on('click', function(e) {
			qr.showCurrent($(this).data("code"));
		});
	});
});

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
			language : qr.language
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
			$.getJSON("/library/" + qr.language + "/idx.json").done(function(data) {
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
		qr.readTitle();
	});

	$(document).on('pagebeforeshow', '#details', function(e, data) {
		if (!qr.title.path) {
			$.mobile.changePage("#current");
			return;
		}
		$("#cover_div").load(qr.getCoverUrl());
	});
});

// ------------------- read

$(document).delegate("#read", "pageinit", function() {

	$("#moreButton").on('click', function(e) {
		qr.nextParagraph();
	});

	$(document).on('pagebeforeshow', '#read', function(e, data) {
		if (!qr.title.path) {
			$.mobile.changePage("#current");
			return;
		}
		qr.loadTitle();
	});
});
