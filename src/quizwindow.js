function quizwindow(levelCache) {

	var quizEntries = [];
	var correctOption;

	var div = $("<div id='quizDiv'/>").appendTo("body");

	return {
		init : init,
		showQuiz : showQuiz
	};

	function init(callback) {
		div.hide();
		div.load("templates/quizform.html", function() {
			var IDEAL_WIDTH = 300;
			var IDEAL_HEIGHT = 300;
			var pageWidth = $(window).width();
			var pageHeight = $(window).height();
			var width = pageWidth < IDEAL_WIDTH ? pageWidth : IDEAL_WIDTH;
			var height = pageHeight < IDEAL_HEIGHT ? pageHeight : IDEAL_HEIGHT;
			div.height(height);
			div.width(width);
			div.css('top', parseInt(pageHeight / 2 - height / 2) + 'px');
			div.css('left', parseInt(pageWidth / 2 - width / 2) + 'px');
			callback();
		});
	}

	function pickNextOption() {
		return "option" + (Math.floor(Math.random() * 3) + 1);
	}

	function showQuiz(quizMap, callback) {
		div.show();

		correctOption = pickNextOption();

		var allEntries = [];
		for ( var key in quizMap) {
			allEntries.push(quizMap[key]);
		}

		var targetLevel = 0;
		while (quizEntries.length < MIN_QUIZ_ENTRIES && targetLevel < DONT_QUIZ_ABOVE) {
			quizEntries = quizEntries.concat(allEntries.filter(function(elem) {
				return elem.level == targetLevel;
			}));
			targetLevel++;
		}

		quizEntries.sort(randomSort);

		showNextQuiz(callback);
		$("#nextQuiz").unbind('click');
		$("#nextQuiz").click(function() {
			showNextQuiz(callback);
			return false;
		});

		// on radio click - show right and wrong answers
		$("input:radio").unbind('click');
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
				levelCache.updateLevel($("#quizWord").text(), 1);
				// auto-increment to next quiz
				setTimeout(function() {
					showNextQuiz(callback);
				}, 1000);
			}
		});
	}
	


	function showNextQuiz(callback) {
		if (quizEntries.length == 0) {
			div.hide();
			callback();
			return;
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

	function randomSort(a, b) {
		return Math.random() > 0.5 ? -1 : 1;
	}

}