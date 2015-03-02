function getDefinitionUrl(word) { // TODO: def manager
	var prefix = word.length > 1 ? word.substring(0, 2) : word[0];
	return "/quizreaderfr/" + "def/" + prefix + "/" + word + ".json";
}

function showWord(dao, count) {
	// clear def
	$("#def_elem").text("");
	// pick a new word
	var pick = Math.floor(Math.random() * count);
	dao.getWordAtIndex(pick, function(word) {
		$("#word_elem").text(word);
		setTimeout(function() {
			$.getJSON(getDefinitionUrl(word)).done(function(entry) {
				var def = entry.definitions[0];
				$("#def_elem").text(def ? def.text : "[definition not found]");
				setTimeout(function() {
					showWord(dao, count);
				}, 3000);
			}).fail(function() {
				setTimeout(function() {
					showWord(dao, count);
				}, 3000);
			});
		}, 2000);
	});
}

$(document).ready(function() {
	getDao(function(dao) {
		dao.getWordCount("fr", function(count) {
			showWord(dao, count);
		});
	});
});