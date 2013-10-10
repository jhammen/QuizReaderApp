var qr = {

	get : function(url) {
		return $.get(url, "html").fail(function(jxhr, status, error) {
			alert(error);
			console.log(error);
		});
	}
};

$(document).delegate("#splash", "pageinit", function() {
	$(document).on('pagebeforeshow', '#splash', function(e, data) {
		qr.get("templates/splash.html").done(function(data) {
			$("#splash_content").html(data);
		})
	})
});