$('document').ready(function() {
	var $state = {
		feedTemplate: $('#content-feeds').children().first().clone(),
		initialSearchText: "euler",
		searchText: "",
		genericWikiThumbnail: "https://upload.wikimedia.org/wikipedia/en/2/28/WikipediaMobileAppLogo.png"
	};


	function getFeeds(searchText) {
		var endpoint = "https://en.wikipedia.org/w/api.php?";
		var params = {
			"action": "query",
			"format": "json",
			"prop": "extracts|info|pageimages",
			"generator": "search",
			"exintro": 1,
			// "explaintext": 1,
			"exsectionformat": "wiki",
			"inprop": "url",
			"piprop": "thumbnail",
			"pithumbsize": "300",
			"pilicense": "any",
			"gsrlimit": "20",
			"gsrsearch": ""
		};

		return new Promise(function (resolve, reject) {			
			params.gsrsearch = encodeURIComponent(searchText);
      		// var cors = "https://crossorigin.me/";
      		var cors = "http://cors-anywhere.herokuapp.com/";
			var url = cors + endpoint + $.param(params);
			$.getJSON(url, resolve);
		});
	}

	function formatFeeds(res) {
		var invalidFeed = null;

		return new Promise(function(resolve, reject) {
			try {
				var feeds = res.query.pages;
				var ff = $.map(feeds, function(feed, index) {
					try {
						return {
							title: feed.title,
							summary: feed.extract,
							url: feed.fullurl,
							thumbnail: feed.hasOwnProperty('thumbnail') ? feed.thumbnail.source : $state.genericWikiThumbnail
						};
					}
					catch(err) {
						// console.log('Error formating feeds', feed);
						return invalidFeed;
					}
				}).filter(function(feed) {
					return feed !== invalidFeed;
				});

				resolve(ff);
			} catch(error) {
				reject('Error formating feeds', feeds);
			}
		});
	}

	function performSearch(text) {
		// console.log('You are searching for', text, $("#search-form").val());

		// Simple caching
		if ( !text || text === $state.searchText) {
			return;
		}


		$state.searchText = text;
		getFeeds(text)
			.then(formatFeeds)
			.then(function (feeds) {
				Promise.resolve(updateView(feeds));
			})
			.catch(function(error) {
				console.log(error);
			});
	}

	function parseContent(content) {
		var e = $.parseHTML(content);
		return e;
	}

	function updateView(feeds) {
		var feed_nodes = feeds.map(function(feed) {
			var t = $state.feedTemplate.clone();
			var title = t.find('.feed-title a');
				title.text(feed.title);
				title.attr('href', feed.url);

			t.find('.feed-thumbnail').attr('href', feed.url);
			t.find('.feed-thumbnail img').attr('src', feed.thumbnail);
			t.find('.feed-content').html(parseContent(feed.summary));
			return t;
		});
		$('#content-feeds').empty();
		$('#content-feeds').append(feed_nodes);	

		// Put a task queue to MathJax asking it render math elements
		MathJax.Hub.Queue(["Typeset", MathJax.Hub, "content-feeds"]);
	}

	$("#search-button").on("click", function (event) {
		performSearch($("#search-form").val());
	});
	$("#search-form").keypress(function (event) {
		if(event.which === 13) {
			event.preventDefault();
			performSearch($("#search-form").val());
		}
	});

	//default content
	performSearch($state.initialSearchText);
});