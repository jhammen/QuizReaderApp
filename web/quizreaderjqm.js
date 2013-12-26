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

	language : null,

	library : null,

	get : function(url) {
		return $.get(url).fail(function(jxhr, status, error) {
			alert(error);
			console.log(error);
		});
	},

	showCurrent : function(code) {
		this.language = code;
		this.library = "/library/" + code;
		$.mobile.changePage("#current");
	},

	showTitle : function(id) {
		alert("showing title " + id);
	},

};

// global init for any page
$(document).delegate("div[data-role='page']", "pageinit", function() {
	if (!qr.language) {
		Handlebars.registerPartial("title", $("#title_template").html());
		$.mobile.changePage("#splash");
	}

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
			e.preventDefault();
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

$(document).delegate("#library", "pageinit", function() {
	var source = $("#library_template").html();
	var template = Handlebars.compile(source);

	function showEntry() {
		$.getJSON(qr.library + "/idx.json").done(function(data) {
			var list = $("#library_list");
			list.html(template(data)).listview("refresh");
			$("li[data-title]", list).on('click', function(e) {
				e.preventDefault();
				qr.showTitle($(this).data("title"));
			});
			$("a[data-path]", list).on('click', function(e) {
				e.preventDefault();
				qr.library = qr.library + "/" + $(this).data("path")
				showEntry();
			});
		}).fail(function(foo, mesg) {
			alert(mesg);
			console.log(foo);
		});
	}

	$(document).on('pagebeforeshow', '#library', function(e, data) {
		showEntry();
	});
});