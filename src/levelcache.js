
function levelcache() {

	var cache = {};

	this.updateLevel = function(word, delta) {
		var newValue = cache[word] + delta;
		if (newValue >= 0) {
			cache[word] = newValue;
			qr.updateQuizLevel(word, cache[word]);
		}
	};

	this.updateEntry = function(ent) {
		cache[ent.word] = ent.level;
	};
	
	this.isUnknownWord = function(word) {
		return !cache[word] || cache[word] < DONT_QUIZ_ABOVE;
	};

}
