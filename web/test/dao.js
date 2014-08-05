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
		console.log("adding title: " + name)
		this.titles.push(name);
	},

	getOpenTitles : function() {
		return this.titles;
	},

	getTitle : function(name) {
		return null;
	},

	getNewWords: function(wordList) {
		if(wordList.length < 3)
			alert("wordlist too short!!!");
		return  [ {
		word : wordList[0]
	}, {
		word : wordList[1]
	}, {
		word : wordList[2]
	} ]
	}

};
