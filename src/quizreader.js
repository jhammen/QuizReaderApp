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

var MIN_QUIZ_ENTRIES = 3;

$(document).ready(function() {

	// set up clickable words
	$("a").click(function() {
		var word = $(this).text();
		$("#content").hide();
		defWindow.showDefinition(word, function() {
			$("#content").show();
		});		
	});

	// parse paragraph from url and unhide up to that point
	var paragraph = parseInt(/[?&]paragraph=([^&]*)/.exec(window.location.search)[1]);
	//unhideToParagraph(paragraph);

	// add text "more" button + handler
	var moreButton = $("<button>More...</button>").appendTo("#content").show();
	moreButton.click(function() {
		paragraph++;
		// show definitions if paragraph exists
		if ($("p:nth-of-type(" + paragraph + ")").length > 0) {
			qr.updateParagraph(paragraph);
			quizRead();
		} else {
			qr.endPage();
		}
	});

	// create divs to show definitions/quizzes
	var greyDiv = $("<div id='greyDiv'/>").appendTo("body");
	var levelCache = new levelcache();
	var defWindow = new defwindow(levelCache);
	var quizWindow = new quizwindow(levelCache);

	// init windows and start
	quizWindow.init(function() {
		defWindow.init(function() {
			quizRead();
		});
	});

	// -- end ready script ---

	function quizRead() {
		// grab all words for the current paragraph
		var wordMap = {};
		$("p:nth-of-type(" + paragraph + ") a").each(function(index) {
			wordMap[$(this).text()] = 1;
		});
		var wordList = Object.keys(wordMap);
		// run definitions window
		greyDiv.show();
		$("#content").hide();
		defWindow.showDefinitions(wordList, function(quizMap) {
			quizWindow.showQuiz(quizMap, function() {
				showText();
			});
		});
	}

	function unhideToParagraph(para) {
		var counter = 0;
		$("#content > *").each(function(index) {
			if ($(this).is('p')) {
				if (++counter == para) {
					return false;
				}
			}
			$(this).show();
		});
	}

	function showText() {
		$("#content").show();
		unhideToParagraph(paragraph + 1);
		greyDiv.hide();
		moreButton.show();
	}

});
