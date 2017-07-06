var CONSTANTS = {
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
		var move = null;
		do {
			var x = randint(m), y = randint(n);
			if (board[x][y] === CONSTANTS.UNOCCUPIED) {
				move = {
					x: x,
					y: y,
					mark: mark
				};
				break;
			}
			count += 1;
		} while (count < m*n*10);

		return new Promise(function (resolve, reject) {
			if (move === null) {
				reject('Invalid move');
			} else {
				resolve(move);
			}
		});
	};

	this.getMark = function (argument) {
		return mark;
	}
};

var ComputerPlayer = HumanPlayer;
var CONTROLLER = null;

function makePlayer(type, mark) {
	// Check if already instantiated
	if (typeof type !== 'string') {
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
		var defaultValue = CONSTANTS.UNOCCUPIED;
		for (var i=0; i<rows; i+=1) {
			board[i] = new Array(cols).fill(defaultValue);
		}
		return board;
	}

	var model = new (function () {
		this.rows = 3;
		this.cols = 3;
		this.cellsToWin = 3;
		this.board = null;
		this.currentPlayer = null;
		this.players = ['Human', 'AI'];
		this.gameStats = null;
		this.firstPlayer = null;

		var self = this;

		function setFirstPlayer(index) {
			self.firstPlayer = self.players[index];
		}

		function resetStats() {
			self.gameStats = {};
			self.players.forEach(function(player){
				self.gameStats[player] = 0;
			});
		}

		this.init = function() {
			var players = self.players;
			for (var i = 0; i < players.length; i++) {
				players[i] = makePlayer(players[i], i);
			}

			self.resetMatch();
		},

		this.resetGame = function () {
			self.board = makeBoard(self.rows, self.cols);
			setFirstPlayer(randint(self.players.length));
			self.currentPlayer = self.firstPlayer;

		}

		this.resetMatch = function () {
			self.resetGame();
			resetStats();
		}
	})();

	var view = new (function () {
		var self = this;
		this.display = function (what) {
			console.log(what);
		};

		this.renderBoard = function (board, status) {
			var m = board.length;
			var n = board[0].length;

			var asciiMap = {
				0: 'x',
				1: 'o'
			};
			asciiMap[CONSTANTS.UNOCCUPIED] = ' ';

			var openning = board[0]
							.map(function (x) {
								return '==';
							})
							.join('');

			var ascii = openning;
			var mappedBoard = board.map(function (row) {
				return row.map(function (player) {
					return asciiMap[player] || String(x);
				})
			});
			if (status && status.line) {
				status.line.forEach(function (cell) {
					var x = cell[0], y = cell[1];
					mappedBoard[x][y] = mappedBoard[x][y].toUpperCase();
				});
			}

			for (var i = 0; i < m; i += 1) {
				ascii += '\n' + mappedBoard[i]
					.map(function (x) {
						return asciiMap[x] || String(x);
					})
					.join(' ');
			}
			ascii += '\n' + openning;
			console.log(ascii);
		};

		this.renderGame = function (model, status) {
			console.log('Player\'s', model.currentPlayer.getMark(), 'move:');
			self.renderBoard(model.board, status);
			console.log('\n');
		}
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

				if (rootValue === CONSTANTS.UNOCCUPIED) {
					return [];
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
			for (var i = 0; i < model.rows; i += 1) {
				for (var j = 0; j < model.cols; j += 1) {
					var winningLines = checkLine(i, j, model.cellsToWin);
					if (winningLines.length) {
						var line = winningLines[0];
						var cell = line[0];
						var player = model.board[cell[0]][cell[1]];
						return {
							status: 'won',
							winner: player,
							line: line,
						}
					}
				}
			}

			var occupiedSlots = 0;
			model.board.forEach(function(row) {
				row.forEach(function (cell) {
					if (cell !== CONSTANTS.UNOCCUPIED) {
						occupiedSlots += 1;
					};
				});
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

		function getNextPlayer(currentPlayer) {
			var players = model.players;
			var n = players.length;
			var i = players.indexOf(currentPlayer);

			return players[(i + 1) % n];
		}

		this.startGame = function (argument) {
			model.currentPlayer = model.firstPlayer;
		};

		function gameEnded () {
			var result = checkGameStatus();
			var ended;
			if (result.status === 'won' || result.status === 'draw') {
				view.display('Game ended');
				view.display(result);
				ended = true;
			} else {
				ended = false;
			}
			if (result.status === 'won') {
				result.line.forEach(function (cell) {
					var x = cell[0], y = cell[1];
					// model.board[x][y] = model.board[x][y].toUpperCase();
					view.display(model.board[x][y]);
				});
			}
			view.renderGame(model, result);
			return ended;
		}

		this.gameOn = function () {
			if (gameEnded()) {
				return;
			}

			model.currentPlayer
				.makeAMove(model.board)
				.then(updateBoard)
				.then(function (argument) {
					model.currentPlayer = getNextPlayer(model.currentPlayer);
					self.gameOn();
				})
				.catch(function (error) {
					console.log(error);
				})
				;

			// model.currentPlayer = nextPlayer;

			// model.currentPlayer
			// 	.makeAMove(model.board)
			// 	.then(updateBoard)
			// 	.then(getNextPlayer)
			// 	.catch(function (error) {
			// 		console.log(error);
			// 	})
			// 	.then(self.gameOn);

			// view.renderGame(model);
		};

		this.takeTurn = function () {
			gameNotEnded()
				.then(function (argument) {
					model.currentPlayer = getNextPlayer(model.currentPlayer);
				})
				.catch(function(error) {
					console.log(error);
				})
				.then(model.currentPlayer.makeAMove)
				.then(updateBoard)
				.then(getNextPlayer)
				;
		};

	})(model, view);

	// (function init () {
	// 	controller.startGame();
	// 	controller.gameOn();
	// })();
	(function test() {
		controller.startGame();
		console.log(model);
		console.assert(model.rows === 3 && model.cols === 3);
		console.assert([0, 1].indexOf(model.currentPlayer.getMark()) !== -1);
		controller.gameOn(model.firstPlayer);
		// controller.takeTurn();
		CONTROLLER = controller;
	})();
});