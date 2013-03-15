var DONT_QUIZ_ABOVE = 5;

function defwindow(levelCache) {

	var quizMap;

	var div = $("<div id='defDiv'/>").appendTo("body");

	var init = function(callback) {
		var IDEAL_WIDTH = 300;
		var IDEAL_HEIGHT = 300;
		var pageWidth = $(window).width();
		var pageHeight = window.innerHeight;
		var width = pageWidth < IDEAL_WIDTH ? pageWidth : IDEAL_WIDTH;
		var height = pageHeight < IDEAL_HEIGHT ? pageHeight : IDEAL_HEIGHT;

		div.load("templates/showdef.html", function() {
			// size center divs
			div.height(height);
			div.width(width);
			div.css('top', parseInt(pageHeight / 2 - height / 2) + 'px');
			div.css('left', parseInt(pageWidth / 2 - width / 2) + 'px');
			callback();
		});
	};

	var defEntries = [];

	function showDefinitions(wordList, callback) {
		div.show();
		quizMap = {};
		// show first definition
		var defWord = showNextDefinition(wordList, callback);
		// show next definition on button click
		$("#nextDef").unbind('click');
		$("#nextDef").click(function() {
			levelCache.updateLevel(defWord, 1);
			defWord = showNextDefinition(wordList, callback);
		});
	}

	function showNextDefinition(wordList, callback) {
		while (defEntries.length == 0) {
			var word = wordList.pop();
			if (!word) { // done
				div.hide();
				callback(quizMap);
				return;
			}
			if (levelCache.isUnknownWord(word)) {
				var arr = JSON.parse(qr.getEntries(word));
				for ( var i = 0; i < arr.length; i++) {
					levelCache.updateEntry(arr[i]);
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

	function showDef(ent) {
		$("#word").text(ent.word);
		$("#defList").empty();
		for ( var i = 0; i < ent.defs.length; i++) {
			var def = ent.defs[i];
			var root = def.root;
			var text = def.text;
			if (root) {
				text = text.replace(root, "<u><a>" + root + "</a></u>");
			}
			$("<li>" + text + "</li>").appendTo("#defList");
			if (root) {
				$("#defList a").click(function() {
					var word = $(this).text();
					lookupDefinition(word);
				});
			}
		}
	}

	function lookupDefinition(word) {
		var arr = JSON.parse(qr.getEntries(word));
		showDef(arr[0]);
	}
	
	function showDefinition(word, callback) {
		div.show();
		lookupDefinition(word);
		$("#nextDef").unbind('click');
		$("#nextDef").click(function() {
			div.hide();
			levelCache.updateLevel(word, -1);
			callback();
		});
	}

	return {
		init : init,
		showDefinition : showDefinition,
		showDefinitions : showDefinitions
	};
}
