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

/**
 * Flash page: requires dao, DefinitionManager
 */
var page = {
		source : null, // TODO: source and listname may not be the same
		language : null
}

function getUrlSearch() {
	var loc = window.location.search;    
	var reg = /[?&]?([^=]+)=([^&]*)/g;
    var ret = {}, tokens;        
    while (tokens = reg.exec(loc)) {
        ret[decodeURIComponent(tokens[1])]
            = decodeURIComponent(tokens[2]);
    }
    return ret;
}

function getLanguage(param) {
	if(param.l && param.l.length == 2) {
		return param.l;
	} else {
		throw "invalid language code";
	}
}

function getWordlistUrl(lang, listname) {	
	return "/" + lang + "/lst/" + listname + ".json";
}

function showWord(list) {	
	// clear def
	$("#def_elem").text("");
	// pick a new word	
	var word = list[Math.floor(Math.random() * list.length)];
	$("#word_elem").text(word);
	setTimeout(function() {
		DefinitionManager.get(page.language, word, function(record) {
			var def = record[page.source][0];
			$("#def_elem").text(def ? def.x : "[definition not found]");
			setTimeout(function() {
				showWord(list);
			}, 3000);
		}).fail(function() {
			setTimeout(function() {
				showWord(list);
			}, 3000);
		});
	}, 4000);
}

$(document).ready(function() {
	getDao(function(dao) {
		// get url search parameters
		var params = getUrlSearch();
		page.source = params.s;
		page.language = getLanguage(params);
		// load the wordlist
		$.getJSON(getWordlistUrl(page.language, page.source)).done(function(list) {
			showWord(list);
		});
	});
});