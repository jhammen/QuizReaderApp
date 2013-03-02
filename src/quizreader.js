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
$(document).ready(function() {

	// set up clickable words
	$("a").click(function() {
		qr.showDef($(this).text());
	});

	// create dialog div
	var quizDiv = $("<div/>").appendTo("body");

	// unhide up to just before the correct paragraph
	var paragraph = RegExp("[?&]paragraph=([^&]*)").exec(window.location.search)[1];
	for ( var i = 1; i < paragraph; i++) {
		$("p:nth-of-type(" + i + ")").show();
	}

	function currentParagraph() {
		return $("p:nth-of-type(" + paragraph + ")");
	}

	// add "more" button + handler: show quiz, expose next paragraph
	var moreButton = $("<button>More...</button>").button().appendTo("body");
	moreButton.click(function() {
		paragraph++;
		if (currentParagraph().length > 0) {
			showWords();
		} else {
			qr.finish();
		}
	});

	
	var wordMap = {};

	showWords();

	function showWords() {
		// show loading dialog
		quizDiv.load("showlist.html", function() {
			quizDiv.dialog({
				modal : true,
				// dialogClass: "no-close"
				buttons : [ {
					text : "OK",
					click : function() {
						$(this).dialog("close");
					}
				} ],
				close : function(event, ui) {
					showDefinitions();
				}
			});
			// find quizwords
			wordMap = {};
			$("p:nth-of-type(" + paragraph + ") a").each(function(index) {
				var word = $(this).text();
				if (!wordMap[word]) {
					wordMap[word] = qr.getQuizLevel(word);
				}
			});
			for ( var key in wordMap) {
				if (wordMap[key] < 3) {
					$("<li>" + key + "</li>").appendTo("#loadingList");
				}
			}
		});
	}

	function showDefinitions() {
		var words = Object.keys(wordMap);
		words.sort();
		quizDiv.load("showdef.html", function() {
			$("#nextDef").button().click(function() {
				var word = words.pop();
				$("#word").text(word);
				$("#def").text(JSON.stringify(qr.getEntry(word)));
			});
			quizDiv.dialog({
				modal : true,
				buttons : [],
				// dialogClass: "no-close"
				close : function(event, ui) {
					showQuiz();
				}
			});
		});
	}

	function showQuiz() {
		quizDiv.load("quizform.html", function() {
			$("#nextQuiz").button().click(function() {
				//$("#word").text(words.pop());
			});
			quizDiv.dialog({
				modal : true,
				buttons : [],
				// dialogClass: "no-close"
				close : function(event, ui) {
					currentParagraph().show();
				}
			});
		});
	}

});
