var qr = {

	get : function(url) {
		return $.get(url, "html").fail(function(jxhr, status, error) {
			alert(error);
			console.log(error);
		});
	}
};

$(document).delegate("#splash", "pageinit", function() {
	var source = $("#splash_template").html();
	var template = Handlebars.compile(source);
	
	$(document).on('pagebeforeshow', '#splash', function(e, data) {
		var data = [{language: "German", count: 99 }, {language: "Spanish", count: 101 }];
		$("#language_list").html(template(data)).listview("refresh");
	});
});