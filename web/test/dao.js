var dao = {

	titles : [],

	getWordCounts : function() {
		return [ {
			language : "German",
			code : "de",
			count : 99
		}, {
			language : "Spanish",
			code : "es",
			count : 101
		} ];
	},

	addTitle : function(name) {
		this.titles.push(name);
	},

	getOpenTitles : function() {
		return this.titles;
	},

	getTitle : function(name) {
		return null;
	}

};