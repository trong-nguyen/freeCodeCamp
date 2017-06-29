$('document').ready(function() {
	var model = {
		session: 25*60,
		break: 5*60,
		isTicking: false,
		inSession: true,
		current: 0,

		addMinutes: function (what, minutes) {
			if (minutes < 0 && model[what] <= 60) {
				return;
			}
			if (what === 'session' || what === 'break') {
				model[what] += minutes * 60;
			} else {
				console.log('Invalid adding minutes to', what);
			}
		},
	};

	var view = new (function () {
		var progressElm = '#clock-progress div';		
		var timeElm = '.clock-digit-container';
		var buttonElm = '#clock-button';

		this.display = function (argument) {
			console.log(argument);
		};

		this.renderClock = function (model) {
			function twoDigits(x) {
				return ("0" + x).slice(-2);
			}

			console.log('Session length:', model.session / 60);
			console.log('Break length:', model.break / 60);
			console.log(model.inSession ? 'In session' : 'In break');
			console.log('Time:', model.current);

			var length = model.inSession ? model.session : model.break;
			var percentage = String(Math.round(model.current / length * 100));
			var minuteTime = twoDigits(Math.floor(model.current / 60)) + twoDigits(model.current % 60);

			for (var i in minuteTime) {
				$('#clock-digit-' + i).text(minuteTime[i]);
			}

			$(progressElm)
				.attr('aria-valuenow', percentage)
				.css('width', percentage + '%');


			if(model.inSession) {
				$(progressElm).removeClass('bg-danger').addClass('bg-primary').text('Session');
				$(timeElm).removeClass('text-danger').addClass('text-primary');
			} else {
				$(progressElm).removeClass('bg-primary').addClass('bg-danger').text('Break');
				$(timeElm).removeClass('text-primary').addClass('text-danger');
			}

			if(model.isTicking) {
				$(buttonElm).text('Pause');
			} else {
				$(buttonElm).text('Start');
			}

			$('#session-length').text(model.session / 60);
			$('#break-length').text(model.break / 60);
		};
	})();

	var controller = new (function (model, view) {
		var model = model;
		var view = view;
		var ticklerID = -1;

		this.increaseSession = function () {
			pause();
			resetClock();
			model.addMinutes('session', 1);
			view.renderClock(model);
		}

		this.decreaseSession = function () {
			pause();
			resetClock();
			model.addMinutes('session', -1);
			view.renderClock(model);
		}

		this.increaseBreak = function () {
			pause();
			resetClock();
			model.addMinutes('break', 1);
			view.renderClock(model);
		}

		this.decreaseBreak = function () {
			pause();
			resetClock();
			model.addMinutes('break', -1);
			view.renderClock(model);
		}

		this.resetClock = function (argument) {
			// api for resetting clock
			resetClock();
			view.renderClock(model);
		}

		function tick () {
			if (model.inSession && model.current >= model.session - 1) {
				model.inSession = false;
				model.current = 0;
			} else if (!model.inSession && model.current >= model.break - 1) {
				model.inSession = true;
				model.current = 0;
			} else {
				model.current += 1;
			}

			view.renderClock(model);
		}

		function resume() {
			ticklerID = setInterval(tick, 1000);
			model.isTicking = true;
		}

		function pause() {
			if(ticklerID !== -1) {
				clearInterval(ticklerID);
				model.isTicking = false;
				ticklerID = -1;
			}
		};

		this.toggleRun = function (argument) {
			if (!model.isTicking) {
				resume();
			} else {
				pause();
			}

			view.renderClock(model);
		};

		function resetClock (argument) {
			model.current = 0;
		}

	})(model, view);

	(function init () {
		view.renderClock(model);

		$('#clock-button').click(function (argument) {
			controller.toggleRun();
		});
		$('#reset-button').click(function (argument) {
			controller.resetClock();
		});
		$('#button-increase-session').click(function (argument) {
			controller.increaseSession();
		});
		$('#button-decrease-session').click(function (argument) {
			controller.decreaseSession();
		});
		$('#button-increase-break').click(function (argument) {
			controller.increaseBreak();
		});
		$('#button-decrease-break').click(function (argument) {
			controller.decreaseBreak();
		});
		$(document).keypress(function (e) {
			// I love the convenience of enter button
			if ([13, 32].indexOf(e.which) !== -1) {
				controller.toggleRun();
			}
		});
	})();
});