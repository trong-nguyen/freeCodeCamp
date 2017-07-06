var constants = {
	UNOCCUPIED: null,
};

function randint(n) {
	return Math.floor(Math.random() * n);
}

var HumanPlayer = function (mark) {
	this.makeAMove = function (board) {
		var m = board.length;
		var n = board[0].length;

		var count = 0;
		do {
			var x = randint(m), y = randint(n);
			if (board[x][y] === constants.UNOCCUPIED) {
				return {
					x: x,
					y: y,
					mark: mark
				};
			}
			count += 1;
		} while (count < m*n*10);
	}
};

function makePlayer(type, mark) {
	// Check if already instantiated
	if (!(type instanceof String)) {
		return type;
	}

	if (type === 'Human') {
		return new HumanPlayer(mark);
	} else if (type === 'AI') {
		return new ComputerPlayer(mark);
	}
}

$('document').ready(function() {
	function makeBoard(rows, cols) {
		var board = new Array(rows);
		var defaultValue = null;
		for (var i=0; i<rows; i+=1) {
			board[i] = new Array(cols).fill(defaultValue);
		}
		return board;
	}

	var model = new (function () {
		var rows = 3;
		var cols = 3;
		var cellsToWin = 3;
		var board = null;
		var currentPlayer = null;
		var players = ['AI', 'Human'];
		var gameStats = null;
		var firstPlayer = null;

		var self = this;

		function setFirstPlayer(index) {
			currentPlayer = players[index];
		}

		function resetStats() {
			gameStats = {};
			players.forEach(function(player){
				gameStats[player] = 0;
			});
		}

		this.init = function() {
			for (var i = 0; i < players.length; i++) {
				players[i] = makePlayer(players[i], String(i));
			}
			players = players.map(function (type) {
				return makePlayer(type);
			});

			self.resetMatch();
		},

		this.resetGame = function () {
			board = makeBoard(model.rows, model.cols);
			setFirstPlayer(randint(model.players.length));
		}

		this.resetMatch = function () {
			self.resetGame();
			resetStats();
		}
	})();

	var view = new (function () {
	})();

	var controller = new (function (model, view) {
		var model = model;
		var view = view;

		model.init();
		self = this;

		function checkGameStatus() {
			function checkLine(xRoot, yRoot, cellsToWin) {
				var board = model.board;
				var rootValue = board[xRoot][yRoot];

				if (rootValue === constants.UNOCCUPIED) {
					return null;
				}

				// vectors in which we could sufficiently check for winning conditions
				var vectors = [[0, 1], [1, 0], [1, 1], [1, -1]];
				
				var results = vectors.map(function (ij) {
					var x = xRoot, y = yRoot;
					var wonCells = [[x, y]];
					for (var c = 1; c < cellsToWin; c += 1){
						x += ij[0];
						y += ij[1];
						if (x < 0 || model.rows <= x
							|| y < 0 || model.cols <= y
							|| board[x][y] !== rootValue) {
							return null;
						} else{
							wonCells.push([x, y])
						}
					}
					return wonCells;
				});

				return results.filter(function (x) {
					return x !== null;
				})
			}

			//brute
			for (var i = 0; i < model.rows; i+=1) {
				for (var j = 0; j < model.cols; j += 1) {
					var winningLines = checkLine(i, j, model.cellsToWin);
					if (winningLines.length) {
						var line = winningLines[0];
						var player = line[0];
						return {
							status: 'won',
							player: player,
							line: line,
						}
					}
				}
			}

			var occupiedSlots = 0;
			model.board.forEach(function(row) {
				row.forEach(cell) {
					if (cell !== constants.UNOCCUPIED) {
						occupiedSlots += 1;
					};
				};
			});

			if (occupiedSlots === model.rows * model.cols) {
				return {
					status: 'draw'
				}
			}

			return {
				status: 'unsettled',
			};
		}

		function updateBoard(move) {
			return new Promise(function(resolve, reject) {
				model.board[move.x][move.y] = move.mark;
				resolve(model.currentPlayer);
			})
		}

		function nextPlayer(currentPlayer) {
			var players = model.players;
			var n = players.length;
			var i = players.indexOf(currentPlayer);
			return players[(i+1) % n];
		}

		this.startGame = function (argument) {
			model.currentPlayer = model.firstPlayer;
		};

		this.gameOn = function (argument) {
			var result = checkGameStatus();
			if (result.status === 'ended' || result.status === 'draw') {
				view.display('Game ended', result);
				return;
			}

			model.currentPlayer
				.makeAMove(model.board)
				.then(updateBoard)
				.then(nextPlayer)
				.catch(function (error) {
					console.log(error);
				});
				.then(self.gameOn)
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