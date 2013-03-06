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

	// parse paragraph from url
	var paragraph = /[?&]paragraph=([^&]*)/.exec(window.location.search)[1];

	function currentParagraph() {
		return $("p:nth-of-type(" + paragraph + ")");
	}

	// add text "more" button + handler
	var moreButton = $("<button>More...</button>").appendTo("#content").show();
	moreButton.click(function() {
		paragraph++;
		if (currentParagraph().length > 0) {
			showDefinitions();
		} else {
			qr.finish();
		}
	});

	showDefinitions();

	var entry = {};

	function showDefinitions() {

		moreButton.hide();
		quizDiv.show();
		// grab all words for the current paragraph
		var wordMap = {};
		$("p:nth-of-type(" + paragraph + ") a").each(function(index) {
			wordMap[$(this).text()] = 1;
		});
		var wordList = Object.keys(wordMap);

		quizDiv.load("templates/showdef.html", function() {
			// show first definition
			showNextDefinition(wordList);
			// show next definition on button click
			$("#nextDef").click(function() {
				showNextDefinition(wordList);
			});
		});
	}

	function showNextDefinition(wordList) {
		var word = getNextQuizWord(wordList);
		if (word) {
			$("#word").text(word);
			var defs = entry[word].defs;
			$("#defList").empty();
			for(var i = 0; i < defs.length; i++) {
				$("<li>" + defs[i].text + "</li>").appendTo("#defList");
			}
		} else {
			showQuiz();
		}
	}

	function getNextQuizWord(wordList) {
		var word = wordList.pop();
		while (word) {
			var ent = JSON.parse(qr.getEntry(word));
			entry[word] = ent;
			if (ent.level == 0) {
				// look out for roots!!!
				return word;
			}
			word = wordList.pop();
		}
		return null;
	}

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
		moreButton.show();
	}

});
