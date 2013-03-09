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

var qr = {};

qr.showDef = function() {
	alert('showDef');
};

qr.finish = function() {
	alert('done');
	window.location = "about:blank";
};

var levels = {};

levels['root'] = 0;

qr.getEntries = function(word) {
	var level = Math.floor(Math.random() * 11);
	if (levels[word]) {
		level = levels[word];
	} else {
		levels[word] = level;
	}
	var root = "";
	var ent2 = "";
	if (Math.random() * 11 < 3) {
		root = ",\"root\":\"root\"";
		ent2 = ", { \"word\": \"root\", \"defs\": [{\"text\" : \"here is the root definition\"}], \"level\": " + levels['root'] + "}";
	}
	var ent = "{ \"word\": \"" + word + "\", \"defs\": [{\"text\" : \"here is the definition for " + word + "\"}], \"level\": " + level + root + "}";
	return "[" + ent + ent2 + "]";
};

qr.updateQuizLevel = function(word, value) {
	levels[word] = value;
	console.log(word + " level updated to " + levels[word]);
};

qr.getSimilarEntry = function(word) {
	return "{ \"word\": \"similar\", \"defs\": [{\"text\" : \"here is the definition for a similar word to " + word + "\"}]}";	
};

qr.getUnrelatedDefinition = function(word1, word2) {
	return "{ \"word\": \"similar\", \"defs\": [{\"text\" : \"here is the definition for an unrelated word \"}]}";
	
};

qr.updateParagraph = function(word) {
}


