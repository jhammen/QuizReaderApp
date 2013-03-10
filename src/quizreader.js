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

	var DONT_QUIZ_ABOVE = 5;
	var MIN_QUIZ_ENTRIES = 3;

	// create divs to show definitions/quizzes
	var defDiv = $("<div/>").appendTo("body");
	var quizDiv = $("<div/>").appendTo("body");

	// set up clickable words
	$("a").click(function() {
		if (quizDiv.is(':hidden')) {
			var word = $(this).text();
			showSingleDefinition(word);
			updateLevel(word, -1);
		} else {
			alert("cannot show definitions while in quiz mode");
		}
	});

	// parse paragraph from url and unhide up to that point
	var paragraph = parseInt(/[?&]paragraph=([^&]*)/.exec(window.location.search)[1]);
	unhideToParagraph(paragraph);

	// add text "more" button + handler
	var moreButton = $("<button>More...</button>").appendTo("#content").show();
	moreButton.click(function() {
		paragraph++;
		// show definitions if paragraph exists
		if ($("p:nth-of-type(" + paragraph + ")").length > 0) {
			qr.updateParagraph(paragraph);
			showDefinitions();
		} else {
			qr.endPage();
		}
	});

	var levelCache = {};

	function updateLevel(word, delta) {
		var newValue = levelCache[word] + delta;
		if (newValue >= 0) {
			levelCache[word] = newValue;
			qr.updateQuizLevel(word, levelCache[word]);
		}
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

	// --- show definitions

	showDefinitions();

	function showDef(ent) {
		$("#word").text(ent.word);
		$("#defList").empty();
		for ( var i = 0; i < ent.defs.length; i++) {
			var def = ent.defs[i];
			$("<li>" + def.text + "</li>").appendTo("#defList");
		}
	}

	function showDefinitions() {
		moreButton.hide();

		// grab all words for the current paragraph
		var wordMap = {};
		$("p:nth-of-type(" + paragraph + ") a").each(function(index) {
			wordMap[$(this).text()] = 1;
		});
		var wordList = Object.keys(wordMap);

		var defEntries = [];
		var quizMap = {};

		// load and show definition template
		quizDiv.load("templates/showdef.html", function() {
			quizDiv.show();
			// show first definition
			var defWord = showNextDefinition();
			// show next definition on button click
			$("#nextDef").click(function() {
				updateLevel(defWord, 1);
				defWord = showNextDefinition();
			});
		});

		function showNextDefinition() {
			while (defEntries.length == 0) {
				var word = wordList.pop();
				if (!word) { // done
					showQuiz(quizMap);
					return;
				}
				if (!levelCache[word] || levelCache[word] < DONT_QUIZ_ABOVE) {
					var arr = JSON.parse(qr.getEntries(word));
					for ( var i = 0; i < arr.length; i++) {
						levelCache[arr[i].word] = arr[i].level;
						if (arr[i].level < DONT_QUIZ_ABOVE && !quizMap[arr[i].word]) {
							quizMap[arr[i].word] = arr[i];
						}
						if (arr[i].level == 0) {
							defEntries.push(arr[i]);
						}
					}
				}
			}
			var ent = defEntries.pop();
			showDef(ent);
			return ent.word;
		}
	}

	function showSingleDefinition(word) {
		moreButton.hide();
		// get entries
		var arr = JSON.parse(qr.getEntries(word));
		defDiv.load("templates/showdef.html", function() {
			showDef(arr[0]);
			$("#nextDef").click(function() {
				defDiv.empty();
				moreButton.show();
			});
		});

	}

	// --- quiz

	function showQuiz(quizMap) {

		var correctOption = pickNextOption();

		function pickNextOption() {
			return "option" + (Math.floor(Math.random() * 3) + 1);
		}

		var allEntries = [];
		for ( var key in quizMap) {
			allEntries.push(quizMap[key]);
		}

		var quizEntries = [];
		var targetLevel = 0;
		while (quizEntries.length < MIN_QUIZ_ENTRIES && targetLevel < DONT_QUIZ_ABOVE) {
			quizEntries = quizEntries.concat(allEntries.filter(function(elem) {
				return elem.level == targetLevel;
			}));
			targetLevel++;
		}

		quizEntries.sort(randomSort);

		quizDiv.load("templates/quizform.html", function() {

			showNextQuiz();

			$("#nextQuiz").click(function() {
				showNextQuiz();
				return false;
			});

			// on radio click - show right and wrong answers
			$("input:radio").click(function(e) {
				$("label[for='" + correctOption + "']").addClass("correct");
				$("input:radio").attr('disabled', 'disabled');
				if (this.id != correctOption) {
					// label bad answer incorrect
					$("label[for='" + this.id + "']").addClass("incorrect");
					// reshuffle
					quizEntries.sort(randomSort);
					// show OK button
					$("#nextQuiz").show();
				} else {
					quizEntries.pop();
					setTimeout(updateWordLevel, 10);
					// auto-increment to next quiz
					setTimeout(showNextQuiz, 1000);
				}
			});
		});

		function showNextQuiz() {
			if (quizEntries.length == 0) {
				showText();
				return false;
			}
			correctOption = pickNextOption();
			// reset form
			$("label").removeClass("correct").removeClass("incorrect");
			$("input:radio").removeAttr('checked');
			$("input:radio").removeAttr('disabled');
			$("#nextQuiz").hide();
			// show word and set definitions
			var ent = quizEntries[quizEntries.length - 1];
			$("#quizWord").text(ent.word);
			// clear label text and add back new entries
			$("label").text("");
			$("label[for='" + correctOption + "']").text(entryString(ent));
			var similarEntry = JSON.parse(qr.getSimilarEntry(ent.word));
			var unrelatedEntry = JSON.parse(qr.getUnrelatedDefinition(ent.word, similarEntry.word));
			if (Math.random() > 0.5) {
				emptyLabel().text(entryString(unrelatedEntry));
				emptyLabel().text(entryString(similarEntry));
			} else {
				emptyLabel().text(entryString(similarEntry));
				emptyLabel().text(entryString(unrelatedEntry));
			}
		}

		function entryString(ent) {
			var defString = "";
			for ( var i = 0; i < ent.defs.length; i++) {
				defString += (i == 0) ? "" : "; ";
				defString += ent.defs[i].text;
			}
			return defString;
		}

		function emptyLabel() {
			for ( var i = 1; i <= 3; i++) {
				var label = $("label[for='option" + i + "']");
				if (label.text().length == 0) {
					return label;
				}
			}
		}

		function updateWordLevel() {
			updateLevel($("#quizWord").text(), 1);
		}
		function randomSort(a, b) {
			return Math.random() > 0.5 ? -1 : 1;
		}

	}

	function showText() {
		unhideToParagraph(paragraph + 1);
		quizDiv.hide();
		moreButton.show();
	}

});
