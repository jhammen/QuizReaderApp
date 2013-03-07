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

	// create div to show definitions/quizzes
	var quizDiv = $("<div/>").appendTo("body");

	// parse paragraph from url
	var paragraph = /[?&]paragraph=([^&]*)/.exec(window.location.search)[1];

	// add text "more" button + handler
	var moreButton = $("<button>More...</button>").appendTo("#content").show();
	moreButton.click(function() {
		paragraph++;
		// show definitions if paragraph exists
		if ($("p:nth-of-type(" + paragraph + ")").length > 0) {
			showDefinitions();
		} else {
			qr.finish();
		}
	});

	// --- show definitions

	showDefinitions();

	function showDefinitions() {
		moreButton.hide();

		// grab all words for the current paragraph
		var wordMap = {};
		$("p:nth-of-type(" + paragraph + ") a").each(function(index) {
			wordMap[$(this).text()] = 1;
		});
		var wordList = Object.keys(wordMap);

		var entries = [];

		// load and show definition template
		quizDiv.load("templates/showdef.html", function() {
			quizDiv.show();
			// show first definition
			showNextDefinition();
			// show next definition on button click
			$("#nextDef").click(function() {
				showNextDefinition();
			});
		});

		function showNextDefinition() {
			while (entries.length == 0) {
				var word = wordList.pop();
				if (!word) { // done
					showQuiz();
					return;
				}
				var arr = JSON.parse(qr.getEntry(word));
				for ( var i = 0; i < arr.length; i++) {
					if (arr[i].level == 0) {
						entries.push(arr[i]);
					}
				}
			}
			var ent = entries.pop();
			$("#word").text(ent.word);
			$("#defList").empty();
			for ( var i = 0; i < ent.defs.length; i++) {
				var def = ent.defs[i];
				$("<li>" + def.text + "</li>").appendTo("#defList");
			}
			qr.updateQuizLevel(ent.word, 1);
		}
	}

	// --- quiz

	function showQuiz() {
		quizDiv.load("templates/quizform.html", function() {
			$("#nextQuiz").click(function() {
				showText();
				return false;
			});
		});
	}

	function showText() {
		// unhide up to the current paragraph
		var counter = 0;
		$("#content > *").each(function(index) {
			$(this).show();
			if ($(this).is('p')) {
				if (++counter == paragraph) {
					return false;
				}
			}
		});
		quizDiv.hide();
		qr.updateParagraph(paragraph);
		moreButton.show();
	}

});
