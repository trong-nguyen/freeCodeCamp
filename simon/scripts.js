function randint(n) {
	return Math.floor(Math.random() * n);
};

function generateRandomArray(size, cap) {
	return Array(size).fill().map(function () {
		return randint(cap) + 1;
	});
};

var Model = function (settings) {
	// Module pattern
	// private members
	var sq = [];
	var buttons = 4;
	var generate = generateRandomArray;
	var correctMove = 0;
	var correctLevel = 0;
	var strictMode = false;

	if (settings) {
		buttons = settings.buttons || buttons;
		generate = settings.generate || generate;
		sq = generate(settings.size || 20, buttons);
		strictMode = settings.strictMode || strictMode;
	}

	return {
		get sequence() {
			return sq.slice(0, correctLevel + 1);
		},

		isStrict: function () {
			return strictMode;
		},

		getButtons: function () {
			return Array(buttons).fill().map(function (_, i) {return i + 1;}); // 1 based
		},

		resetSequence: function () {
			if (sq) {
				sq = generate(sq.length, buttons);
			}
			correctMove = 0;
			correctLevel = 0;
			return sq;
		},

		checkMove: function (move) {
			if (move < 1 || move > buttons ) {
				throw 'Invalid move';
			}

			if (move === sq[correctMove]) {
				correctMove += 1;
				if (correctMove === sq.length) {
					this.resetSequence();
					return 'won';
				} else if (correctMove === correctLevel + 1) {
					correctMove = 0;
					correctLevel += 1;
					return 'levelUp'
				}
				else {
					return 'correct';
				};
			} else {
				if (strictMode) {
					correctLevel = 0;
				}
				correctMove = 0;
				return 'incorrect';
			}
		},

		setStrictMode: function (value) {
			strictMode = value;
		},
	}
};

var view = (function () {
	var doc = $(document);
	var statusElm = $('#status');
	var roundElm = $('#round-status');
	var btnElms = [];
	var overlayElm = $('.overlay');
	var statuses = {
		won: 'Game ended, you won!',
		incorrect: 'Incorrect pattern, try again!',
		reset: 'Successfully reset, new game started!',
		correct: 'Correct, keep going!',
		levelUp: 'Leveled up, proceed to next round!'
	};
	var statusStyles = {
		won: 'alert-success',
		incorrect: 'alert-danger',
		reset: 'alert-danger',
		levelUp: 'alert-info',
		correct: 'alert-info',
	};

	function blink(elm, duration) {
		duration = duration || 50;
		return new Promise(function (resolve, reject) {
			elm.fadeOut(duration).fadeIn(duration, resolve);
		});
	}

	function beep(elm) {
		// the clone() is crucial or else consecutive play()
		// might not produce consecutive sounds
		return elm.clone().find('audio')[0].play();
	}

	function removeStatusStyles () {
		statusElm.removeClass(Object.values(statusStyles).join(' '));
	}

	function displayStatus(result, message) {
		removeStatusStyles();
		message = message || statuses[result];
		var toBlink = statusElm.text() === message;
		statusElm.text(message)

		style = statusStyles[result] || 'alert-info';
		statusElm.addClass(style);

		if (toBlink) {
			blink(statusElm);
		}
	}

	function getButton(note) {
		return $('#btn-' + String(note));
	}

	function addEffects(note, duration) {
		var btn = getButton(note);
		return Promise.all([
			blink(btn, duration),
			beep(btn),
		]);
	}

	return {
		display: function (what) {
			statusElm.text(what);
		},

		displayRound: function (round) {
			roundElm.text('Round ' + round);
		},

		displayPattern: function (pattern) {
			var wait = 500;
			return Promise.all(pattern.map(function (note, i) {
				return new Promise(function (resolve, reject) {
					setTimeout(function () {
						var btn = getButton(note);
						addEffects(note, 200).then(resolve);
					}, wait*i);
				});
			}));
		},

		displayStatus: displayStatus,

		displaySettled: function (result, callback) {
			overlayElm.show();
			displayStatus(result);
			$(document).one('click', function () {
				overlayElm.hide();
				callback();
			});
		},

		awaitInputs: function (simonButtons, callback) {
			doc.keypress(function (e) {
				var pressable = simonButtons.map(function (b) {
					return b + 48;
				});
				if (pressable.indexOf(e.keyCode) !== -1) {
					var note = e.keyCode - 48;
					var btn = getButton(note);
					addEffects(note, 50);
					callback(note);
				}
			});

			simonButtons.forEach(function (note) {
				getButton(note).click(function (e) {
					addEffects(note, 50);
					callback(note);
				});
			});

			btnElms = simonButtons.map(getButton);

			$('#btn-reset').one('click', function (e) {
				callback('reset');
			});
		},

		ignoreInputs: function () {
			doc.off();
			btnElms.forEach(function (btn) {
				btn.off();
			});
		}
	};
})();

var controller = (function (v){
	var model = Model({
		buttons: 4,
		size: 20
	});

	var view = v;
	var waitBetweenMoves = 200;
	var waitBetweenKeys = 200;
	var waitBetweenRounds = 1000;

	function playPattern() {
		return new Promise(function (resolve, reject) {
			view.displayPattern(model.sequence)
				.then(function () {
					resolve();
				});
		});
	}

	function settleGame(result) {
		view.displaySettled(result, gameOn);
	}

	function checkInput(input) {
		if (input === 'reset') {
			disableUserInput();
			model.resetSequence();			
			view.displayRound(model.sequence.length);
			settleGame('reset');
		}
		else {
			var result = model.checkMove(input);
			view.displayStatus(result);
			if (result !== 'correct') {
				// correct means more inputs are coming
				disableUserInput();
			}

			if (result === 'won') {
				settleGame(result);
			} else if (result === 'levelUp') {
				setTimeout(gameOn, waitBetweenRounds);
			} else if (result === 'correct') {
				view.awaitInputs
			}
			else if (result === 'incorrect'){
				if (model.isStrict()) {
					settleGame(result);
				} else {
					setTimeout(gameOn, waitBetweenRounds);
				}
			}
		}
		view.displayRound(model.sequence.length);
	};

	function disableUserInput() {
		view.ignoreInputs();
	}

	function enableUserInput() {
		view.awaitInputs(model.getButtons(), checkInput);
	}

	function gameOn() {
		// wait for seconds before starting game
		(function (argument) {
			return new Promise(function (resolve, reject) {
				setTimeout(resolve, 1000);
			});
		})().then(playPattern)
			.then(enableUserInput)
			.catch(function (error) {
				console.log(error);
			});
	}

	return {
		init: function () {
			view.displayStatus(null, 'Game started, playing pattern ...');

			var strictBtn = $('#enable-strictmode');
			strictBtn.change(function (argument) {
				model.setStrictMode(strictBtn.prop('checked'));
			})
		},
		gameOn: gameOn
	};
})(view);

$('document').ready(function() {
	(function init(argument) {
		controller.init();
		controller.gameOn();
	})();
});
