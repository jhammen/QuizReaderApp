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

qr.getQuizLevel = function(word) {
	return Math.floor(Math.random()*11);
};

qr.getEntry = function(word) {
	return "{ def: 'here is the definition' }";
};