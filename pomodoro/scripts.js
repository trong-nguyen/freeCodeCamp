
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
		var timeElm = '#clock-time';

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
			var minuteTime = twoDigits(Math.floor(model.current / 60)) + ':' + twoDigits(model.current % 60);
			$(progressElm)
				.attr('aria-valuenow', percentage)
				.addClass(model.inSession ? 'bg-primary' : 'bg-danger')
				.css('width', percentage + '%');

			$(timeElm).text(minuteTime);

			if(model.inSession) {
				$(progressElm).removeClass('bg-danger').addClass('bg-primary');
				$(timeElm).removeClass('text-danger').addClass('text-primary');
			} else {
				$(progressElm).removeClass('bg-primary').addClass('bg-danger');
				$(timeElm).removeClass('text-primary').addClass('text-danger');
			}
				
		};
	})();

	var controller = new (function (model, view) {
		var model = model;
		var view = view;
		var ticklerID = -1;

		function alertIfTicking() {
			if (model.isTicking) {
				view.display('Pause the clock before adjustment!');
				return true;
			}
			return false;
		}

		this.increaseSession = function () {
			if (alertIfTicking()) {
				return;
			}
			model.addMinutes('session', 1);
			// view.displaySession(model.session / 60);
			view.renderClock(model);
		}

		this.decreaseSession = function () {
			if (alertIfTicking()) {
				return;
			}
			model.addMinutes('session', -1);
			// view.displaySession(model.session / 60);
			view.renderClock(model);
		}

		this.increaseBreak = function () {
			if (alertIfTicking()) {
				return;
			}
			model.addMinutes('break', 1);
			// view.displayBreak(model.break / 60);
			view.renderClock(model);
		}

		this.decreaseBreak = function () {
			if (alertIfTicking()) {
				return;
			}
			model.addMinutes('break', -1);
			// view.displayBreak(model.break / 60);
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
				model.current += 100;
			}

			view.renderClock(model);
		}

		this.resume = function () {
			ticklerID = setInterval(tick, 1000);
			model.isTicking = true;
		};

		this.pause = function () {
			if (ticklerID != -1) {
				clearInterval(ticklerID);
				model.isTicking = false;
				ticklerID = -1;
				view.stopClock();
			}
		};

	})(model, view);

	(function init () {
		controller.resume();
	})();
});