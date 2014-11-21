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

var settingsmanager = (function() {

	var settings;
	var settingsDao;

	function init(dao, callback) {
		settingsDao = dao;
		dao.getAllSettings(function(data) {
			settings = data;
			callback();
		});
	}

	function getSetting(key, value) {
		return settings[key] ? settings[key] : value;
	}

	function saveSettings(data, callback) {
		settings = data;
		var remaining = 0;
		for ( var key in data) {
			remaining++;
		}
		for ( var key in data) {
			settingsDao.saveSetting(key, data[key], function() {
				if (!--remaining) {
					callback();
				}
			});
		}
		// callback();
	}

	return {
		init : init,
		getSetting : getSetting,
		saveSettings : saveSettings
	};
}());
