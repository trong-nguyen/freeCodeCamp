$('document').ready(function() {
	var $state = {
		template: $('#content-streamers').children().first().clone(),
		genericAvatar: "https://upload.wikimedia.org/wikipedia/en/2/28/WikipediaMobileAppLogo.png",
		streamers: [
			'freecodecamp', 
			'ESL_SC2', 
			'SomePlayer',
			'OgamingSC2', 
			'cretetion', 
			'storbeck',
			'TV_Tippy',
			'syndicate',
			'habathcx', 
			'RobotCaleb', 
			'noobs2ninjas'
		],
		CORSProxy:  'http://cors-anywhere.herokuapp.com/',
		// CORSProxy: '',

		rootAPI: 'https://wind-bow.gomix.me/twitch-api/',
		playerEndpoint: 'https://player.twitch.tv/?muted=true&autoplay=false&',
		invalidStreamer:  {
			display_name: 'Account Unknown',
			name: 'unknown',
			logo: 'https://image.flaticon.com/icons/svg/37/37943.svg',
			unknown: true
		},
		defaultStreamerLogo: 'https://pbs.twimg.com/profile_images/2349866958/m9pjwl1x1n3nvzf8x8rc.png',
		invalidStream: null,

		playerOptions: {
			// width: '100%',
			// height: '100%',			
			autoplay: false,
			muted: true
		}
	};

	function getData(params) {
		return new Promise(function (resolve, reject) {      		
			var cors = '';
			var url = $state.CORSProxy + $state.rootAPI + params.endpoint + params.query;
			$.getJSON(url, resolve);
		});
	}

	function getProfile(streamer) {
		return getData({
			endpoint: 'users/',
			query: streamer
		});
	}

	function getStream(streamer) {
		return getData({
			endpoint: 'streams/',
			query: streamer
		});
	}

	function formatProfile(res) {
		try {
			return {
				display_name: res.display_name,
				name: res.name,
				logo: res.logo || defaultStreamerLogo,
				url: res._links.self
			};
		}
		catch(err) {
			return $state.invalidStreamer;
		}	
	}

	function formatStream(res) {
		if(!res.stream) {			
			return $state.invalidStream;
		}

		try {
			var stream = res.stream;
			var channel = stream.channel;
			return {
				game: stream.game,
				viewers: stream.viewers,				
				isLive: stream.stream_type === 'live',
				preview: stream.preview.medium,
				_id: stream._id,
				channel: {
					logo: channel.logo,
					profile_banner: channel.profile_banner,
					views: channel.views,
					followers: channel.followers,
					display_name: channel.display_name,
					status: channel.status,
					url: channel.url,
					_id: channel._id
				},
				url: stream._links.self
			};
		}
		catch(err) {
			console.log('Stream invalid', res);
			return $state.invalidStream;
		}	
	}

	function fetchStream(streamer) {
		// working on part of bundle and
		// returning the whole bundle
		return new Promise(function (resolve, reject) {
			getStream(streamer.profile.name)
				.then(function(res) {
					streamer.stream = formatStream(res);
					resolve(streamer);
				})
				.catch(function(error) {
					console.log('error fetching streamer', streamer);
					reject();
				});
		});
	}

	function fetchProfile(streamer) {
		return new Promise(function (resolve, reject) {
			getProfile(streamer)
				.then(function(res) {
					resolve({
						profile: formatProfile(res),
						queriedId: streamer
					});
				})
				.catch(function(error) {
					console.log('error fetching profile', streamer);
					reject();
				});
		});
	}

	function fetchData() {
		Promise.all($state.streamers.map(fetchProfile))
			.then(function(data) {				
				return Promise.all(data.map(fetchStream));
			})			
			.then(function(data) {
				console.log(data);			
				updateView(data);
			})
			.catch(function(error) {
				console.log(error);
			});
	}

	function parseContent(content) {
		var e = $.parseHTML(content);
		return e;
	}

	function updateView(streamers) {
		function makePlayerId(streamer) {
			return 'player-' + streamer.profile.name;
		}

		var streamer_nodes = streamers.map(function(streamer) {
			var profile = streamer.profile;
			var stream = streamer.stream;

			if (profile.unknown) {
				profile.display_name = streamer.queriedId + ' (unknown)';
			}


			var t = $state.template.clone();

			t.find('.streamer-avatar').attr('href', profile.url);
			t.find('.streamer-avatar img').attr('src', profile.logo);
			t.find('.streamer-name').text(profile.display_name);

			if (profile.unknown) {
				t.find('.stream-live')
					.text('Unknown')
					.addClass('badge-danger');

				t.find('.stream-details').hide();
				t.addClass('display-unknown');
			} else if (stream) {
				var channel = stream.channel;

				t.find('.stream-live')
					.text('Streaming')
					.addClass('badge-success');

				t.find('.streamer-game').text(stream.game);

				t.find('.stream-status')
					.attr('href', channel.url)
					.text(channel.status);

				t.find('.stream-views').text(stream.viewers + ' viewers');
				t.find('.stream-preview').attr('href', channel.url);
				t.find('.stream-preview img').attr('src', stream.preview);

				var playerID = makePlayerId(streamer);
				t.find('.stream-player').attr('id', playerID);


				t.addClass('display-streaming');
			} else {
				t.find('.stream-live')
					.text('Offline')
					.addClass('badge-warning');

				t.find('.stream-details').hide();
				t.addClass('display-offline');
			}

			return t;
		});
		$('#content-streamers').empty();
		$('#content-streamers').append(streamer_nodes);

		// Loop again to load player to livestreams
		// due to Twich Player API works on real DOM only
		streamers.forEach(function(streamer) {
			var profile = streamer.profile;
			var stream = streamer.stream;
			if (stream) {
				var playerID = makePlayerId(streamer);
				var o = $.extend({}, $state.playerOptions, {channel: profile.name});
				new Twitch.Player(playerID, o);
			}
		});
	}

	function toggleDisplay(what) {
		var displayValues = {
			Streaming: '.display-streaming', 
			Offline: '.display-offline', 
			Unknown: '.display-unknown'
		};
		if (what === 'All') {
			$.each(displayValues, function(k, v) {
				$(v).show();
			});		
		} else {
			$.each(displayValues, function(k, v) {
				$(v).hide();
			});	
			$(displayValues[what]).show();
		}
	}

	$(".dropdown-menu li a").click(function(){
		var text = $(this).text();
		toggleDisplay(text);
	    $(this).parents(".dropdown").find('.btn').html(text + ' <span class="caret"></span>');
  		$(this).parents(".dropdown").find('.btn').val($(this).data('value'));
	});


	//default content
	fetchData();
});