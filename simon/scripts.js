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
				return false;
			}
		},
	}
};

var view = (function () {
	var doc = $(document);
	return {
		display: function (what) {
			console.log(what);
		},

		render: function (what) {
			console.log('Rendered', what);
		},

		displayPattern: function (pattern) {
			console.log('Pattern preview', pattern);
			return Promise.resolve();
		},

		displaySettled: function (result) {
			if (result === 'won') {
				console.log('Game ended, you won!')
			} else {
				console.log('Incorrect pattern, try again!')
			}
		},

		awaitInputs: function (simonButtons, callback) {
			doc.keypress(function (e) {
				console.log('You entered: ', e.keyCode - 48);
				var pressable = simonButtons.map(function (b) {
					return b + 48;
				});
				if (pressable.indexOf(e.keyCode) !== -1) {
					callback(e.keyCode - 48);
				}
			});
		},

		ignoreInputs: function () {
			doc.off();
		}
	};
})();

var controller = (function (v){
	var model = Model({
		buttons: 4,
		size: 5
	});

	var view = v;
	var waitBetweenMoves = 200;
	var waitBetweenKeys = 200;
	var waitBetweenRounds = 1000;

	function init () {
		view.render();
	};

	function playPattern(pattern) {
		return new Promise(function (resolve, reject) {
			view.displayPattern(pattern)
				.then(function () {
					resolve();
				});
		});
	}

	function settleGame(result) {
		view.displaySettled(result);
		$(document).one('click', function (argument) {
			gameOn();
		});
	}

	function restartRound() {
		setTimeout(gameOn, waitBetweenRounds);
	}

	function checkInput(input) {
		var result = model.checkMove(input);
		if (result === 'won') {
			disableUserInput();
			settleGame(result);
		} else if (result === 'levelUp') {
			view.display('Leveled up, proceed to next round!');
			disableUserInput();
			setTimeout(gameOn, waitBetweenRounds);
		} else if (result === 'correct') {
			view.display('Correct, keep going!');
		} else {
			if (model.isStrict()) {
				disableUserInput();
				settleGame(result);
			} else {
				view.display('Incorrect, try again!');
				disableUserInput();
				setTimeout(gameOn, waitBetweenRounds);
			}
		}
	};

	function disableUserInput() {
		view.ignoreInputs();
	}

	function iterate() {
		view.awaitInputs(model.getButtons(), checkInput);
	}

	function gameOn() {
		playPattern(model.sequence)
			.then(iterate)
			.catch(function (error) {
				console.log(error);
			});
	}

	return {
		init: init,
		gameOn: gameOn
	};
})(view);

(function init(argument) {
	// view.render();
	controller.gameOn();
})();