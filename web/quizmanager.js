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

var quizmanager = (function() {

	var wordDao;
	var wordCount;

	function init(dao, callback) {
		wordDao = dao;
		dao.getWordCount(function(count) {
			wordCount = count;
			callback();
		});
	}

	function getDaoWord(entry, callback) {
		var pick = Math.floor(Math.random() * wordCount);
		wordDao.getWordAtIndex(pick, callback);
	}

	function getWrongAnswer(quizzes, entry, callback) {
		// maybe use another word from same set
		if (!wordCount || Math.random() > 0.7) {
			var pick = Math.floor(Math.random() * quizzes.length);
			callback(quizzes[pick]);
		} else {
			getDaoWord(entry, callback);
		}
	}

	function makeQuiz(quizzes, entry, callback) {
		var quiz = {};
		quiz.answer = [];
		var pick = Math.floor(Math.random() * 3);
		quiz.correct = pick + 1;
		quiz.answer[pick] = entry.word;
		var slot1 = (pick == 0) ? 1 : 0;
		var slot2 = (pick == 2) ? 1 : 2;
		getWrongAnswer(quizzes, entry, function(word1) {
			quiz.answer[slot1] = word1;
			getWrongAnswer(quizzes, entry, function(word2) {
				quiz.answer[slot2] = word2;
				callback(quiz);
			});
		});
	}

	return {
		init : init,
		getQuiz : makeQuiz
	};
}());
