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

qr.getEntry = function(word) {
	var level = Math.floor(Math.random()*11);
	var root = "";
	if(Math.random()*11 < 3) {
		root = ",\"root\":\"whut??\"";
	}
	var ent =  "{ \"word\": \"" + word + "\", \"defs\": [{\"text\" : \"here is the definition\"}], \"level\": " + level + root + "}";
	var ent2 =  "{ \"word\": \"" + "root" + "\", \"defs\": [{\"text\" : \"here is the definition\"}], \"level\": " + level + root + "}";
	return "[" + ent + "," + ent2 + "]";
};

qr.updateQuizLevel = function(word) {}

qr.updateParagraph = function(word) {}
