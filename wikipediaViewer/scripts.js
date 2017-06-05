$('document').ready(function() {
	function getFeeds(searchText) {
		var endpoint = "https://en.wikipedia.org/w/api.php?";
		var params = {
			"action": "query",
			"format": "json",
			"maxlag": "10",
			"prop": "extracts|images|info",
			"inprop": "url",
			"generator": "search",
			"redirects": 1,
			"exintro": 1,
			"explaintext": 1,
			"exsectionformat": "plain",
			"imlimit": "1",
			"gsrsearch": ""
		};

		return new Promise(function (resolve, reject) {			
			params.gsrsearch = searchText;
      		var cors = "https://crossorigin.me/";
			var url = cors + endpoint + $.param(params);
			$.getJSON(url, resolve);
		});
	}

	// TEST this var p = getFeeds("man").then(formatFeeds).then(function(d) {console.log(d)});
	function formatFeeds(res) {
		var feeds = $.makeArray(res.query.pages);
		var ff = $.map(feeds, function(key, feed) {
			return {
				summary: feed.extract,
				url: feed.fullurl,
				image: feed.images[0]
			}
		});
		return Promise.resolve(ff);
	}

	function performSearch() {
		var text = $("#search-form").val();
		console.log("You searched for: ", text);

		getFeeds(text)
			.then(formatFeeds)
			.then(updateView)
			.catch(function(error) {
				console.log(error);
			});
	}

	$("#search-button").on("click", performSearch);
	$("#search-form").keypress(function (event) {
		if(event.which === 13) {
			event.preventDefault();
			performSearch();
		}
	});
});