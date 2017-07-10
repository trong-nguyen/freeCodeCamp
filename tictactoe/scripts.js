var CONSTANTS = {
	UNOCCUPIED: null,
};

var TicTacToe = {
	archive: {},

	codeBoard: function (board, player) {
		var code = 'p' + String(player) + '-';
		board.forEach(function (rows) {
			rows.forEach(function (cell) {
				code += (cell === CONSTANTS.UNOCCUPIED ? '_' : String(cell));
			})
		});
		return code;
	},

	codeMove: function (moves) {
		var code = '';
		return moves.map(function (move) {
			return 'x' + move[1][0] + ':' + 'y' + move[1][1] + ':' + String(move[0]);
		}).join(' | ');
	},

	checkGameStatus: function(game) {
		var board = game.board;
		var cellsToWin = game.cellsToWin;
		var rows = board.length;
		var cols = board[0].length;

		function checkLine(xRoot, yRoot, cellsToWin) {
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
					if (x < 0 || rows <= x
						|| y < 0 || cols <= y
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
		for (var i = 0; i < rows; i += 1) {
			for (var j = 0; j < cols; j += 1) {
				var winningLines = checkLine(i, j, cellsToWin);
				if (winningLines.length) {
					var line = winningLines[0];
					var cell = line[0];
					var player = board[cell[0]][cell[1]];
					return {
						status: 'won',
						winner: player,
						line: line,
					}
				}
			}
		}

		var occupiedSlots = 0;
		board.forEach(function(row) {
			row.forEach(function (cell) {
				if (cell !== CONSTANTS.UNOCCUPIED) {
					occupiedSlots += 1;
				};
			});
		});

		// console.log('Board, unoccupiedSlots', board, occupiedSlots);
		return occupiedSlots === rows * cols ? {status: 'draw'} : {status: 'unsettled'} ;
	},

	getUnoccupied: function (board) {
		var unoccupied = [];
		for (var i in board) {
			for (var j in board[i]) {
				if (board[i][j] === CONSTANTS.UNOCCUPIED) {
					unoccupied.push([i, j]);
				}
			}
		}
		return unoccupied;
	},

	minmax: function (game, depth, printPlays) {
		// The depth gives bias towards quicker winning moves and slower losing ones.
		var archive = TicTacToe.archive;
		var boardCode = TicTacToe.codeBoard(game.board, game.player);
		if (true && archive[boardCode]) {
			if (printPlays) {
				console.log('Best move', TicTacToe.codeMove([archive[boardCode]]));
			}
			return archive[boardCode];
		}


		function copyFillSlot(board, slot, player) {
			// clone the board, fill in the slot and return
			function clone (board) {
				return board.map(function (rows) {
					return rows.slice(0, rows.length);
				});
			}
			var nb = clone(board);
			nb[slot[0]][slot[1]] = player;

			return nb;
		}

		function scoreGame(game, player) {
			const n = game.board.length;
			var score = {
				'won': 2*n*n,
				'lost': -2*n*n,
				'draw': 0
			};

			var result = TicTacToe.checkGameStatus(game);
			var status = result.status;

			if (status === 'draw') {
				return score.draw;
			} else if (status === 'won') {
				return [score.lost, score.won][Number(result.winner === player)];
			} else {
				return null;
			}
		}


		var board = game.board;
		var player = game.player;
		var nextPlayer = game.next(player);
		var newGame = {};
		for (var k in game) {
			newGame[k] = game[k];
		}
		newGame.player = nextPlayer;


		var unoccupiedSlots = TicTacToe.getUnoccupied(board);
		// console.log('board', board);
		// console.log('unoccupiedSlots', unoccupiedSlots);

		var playedOut = unoccupiedSlots.map(function (slot) {
			var newBoard = copyFillSlot(board, slot, player);
			newGame.board = newBoard;
			var score = scoreGame(newGame, player);

			// console.log('allBoard, currentPlayer', player, ', nextPlayer', nextPlayer, TicTacToe.codeBoard(newBoard, nextPlayer));
			if (score != null) {
				// Base case termination
				return [score+depth, slot];
			} else {
				var tic = TicTacToe.minmax(newGame, depth-1);
				return [-tic[0], slot];// their wins are my loss
			}
		});


		// a min function working on arrays
		var bestMove = playedOut.reduce(function (a, p) {
			if (a[0] === p[0]) {
				// adding some random factor for equivalent choices
				return [a, p][randint(2)];
			}

			return a[0] > p[0] ? a : p;
		});

		if (false || printPlays) {
			console.log(
				'Played out',
				boardCode,
				TicTacToe.codeMove(playedOut),
				bestMove,
				game,
				game.next(player),
			);
		}

		archive[boardCode] = bestMove;

		return bestMove;
	},

	randomMove: function (game) {
		var board = game.board;

		var m = board.length;
		var n = board[0].length;

		var count = 0;
		var move = null;
		do {
			var x = randint(m), y = randint(n);
			if (board[x][y] === CONSTANTS.UNOCCUPIED) {
				move = {
					x: x,
					y: y
				};
				break;
			}
			count += 1;
		} while (count < m*n*10);

		return move;
	},

	calculatedMove: function (game) {
		var n = game.board.length;
		var depth = n * n;
		var tic = TicTacToe.minmax(game, depth, true);
		var move = {
			x: tic[1][0],
			y: tic[1][1]
		};

		return move;
	}
};




function randint(n) {
	return Math.floor(Math.random() * n);
}

var HumanPlayer = function (mark) {
	var self = this;
	var _mark = mark;

	this.getMark = function (argument) {
		return _mark;
	}
	
	this.makeAMove = function (game) {
		return new Promise(function (resolve, reject) {
			game.hotline.player = {
				mark: _mark,
				resolve: function (move) {
					resolve(move);
				},
			}	
		});
	};
};

var RandomPlayer = function (mark) {
	var self = this;
	var _mark = mark;

	this.getMark = function (argument) {
		return _mark;
	}

	this.makeAMove = function (game) {
		game.player = _mark;
		var move = TicTacToe.randomMove(game);

		return new Promise(function (resolve, reject) {
			if (move === null) {
				reject('Invalid move');
			} else {
				move.mark = _mark;
				resolve(move);
			}
		});
	};
};

var ComputerPlayer = function (mark) {
	var _mark = mark;
	this.getMark = function (argument) {
		return _mark;
	}

	this.makeAMove = function (game) {
		game.player = _mark;
		var movesLeft = TicTacToe.getUnoccupied(game.board).length;
		var make = movesLeft < 12 ? TicTacToe.calculatedMove : TicTacToe.randomMove;
		var move = make(game);
		return new Promise(function (resolve, reject) {
			if (move === null) {
				reject('Invalid move');
			} else {
				move.mark = _mark;
				resolve(move);
			}
		});
	};
};

// var ComputerPlayer = HumanPlayer;

var CONTROLLER = null;

function makePlayer(type, mark) {
	// Check if already instantiated
	if (typeof type !== 'string') {
		return type;
	}

	if (type === 'Random') {
		return new RandomPlayer(mark);
	} else if (type === 'AI') {
		return new ComputerPlayer(mark);
	} else if (type === 'Human') {
		return new HumanPlayer(mark);
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
		this.rows = 20;
		this.cols = 20;
		this.cellsToWin = 5;
		this.board = null;
		this.currentPlayer = null;
		this.players = ['Human', 'AI'];
		this.gameStats = null;
		this.firstPlayer = null;
		var humanPlaying = false;

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
				if (players[i] === 'Human') {
					humanPlaying = true;
				}
				players[i] = makePlayer(players[i], i);
			}
			self.resetMatch();
		};

		this.humanIsPlaying = function () {
			return humanPlaying;
		}

		this.resetGame = function () {
			self.board = makeBoard(self.rows, self.cols);
			setFirstPlayer(randint(self.players.length));
			setFirstPlayer(0);
			self.currentPlayer = self.firstPlayer;

		};

		this.resetMatch = function () {
			self.resetGame();
			resetStats();
		};
	})();

	var view = new (function () {
		var boardElm = $('#board');
		var cellTemlate = boardElm.find('tr').first().clone();

		var renderMap = {
			0: {
				icon: 'fa-times',
				text: 'text-success',
			},
			1: {
				icon: 'fa-circle-o',
				text: 'text-danger',
			}
		};

		var self = this;
		this.display = function (what) {
			console.log(what);
		};

		function encodeCellId(x, y) {
			return  String(x) + '-' + String(y);
		}

		this.renderBoard = function (board, status) {	
			var m = board.length;
			var n = board[0].length;

			// CSS
			// Change the columns layout
			var colSize = String(100. / n) + '%';
			var markSize = 12. * 3 / n; // 12vw is nice for a board of m columns
			var tdStyle = 'style="width: ' + String(colSize) + ';"';
			var markStyle = 'style="font-size: ' + String(markSize) + 'vmin;"';


			console.log('Processing inner');
			// THE FOLLOWING LINES ARE HIGLY COUPLED WITH encodeCellId
			// MUST BE CHANGED ON CHANGIN that as well
			var templateString = cellTemlate.html()
				.replace('id=""', 'id="" ' + tdStyle)
				.replace('class="subtable-cell hidden"', 'class="subtable-cell hidden" ' + markStyle);
			console.log(templateString);
			var row = Array(n);
			var i = row.length;
			while (i--) {
				row[i] = templateString.replace('id=""', 'id="' + String(i) + '"' + tdStyle);
			}
			var templateRow = '<tr>' + row.join('\n') + '</tr>';
			var table = Array(m);
			var i = table.length;
			while (i--) {
				table[i] = templateRow.replace(/id="/g, 'id="' + String(i) + '-');
			}
			// END OF COUPLED LINES
			boardElm.empty();
			boardElm.html(table.join('\n'))
			console.log('done processing inner');

			// SLOWER IMPLEMENTATION, LEANER BUT SLOW DUE TO JQUERY OVERHEAD
			// var cells = board.map(function(row) {
			// 	return row.map(function (cell) {
			// 		var template = cellTemlate.clone();					
			// 		return template;
			// 	});
			// });

			// HERE
			// boardElm.empty();
			// $.each(cells, function (i, row) {
			// 	var tr = $('<tr></tr>');
			// 	$.each(row, function (j, cell) {
			// 		cell.attr('id', encodeCellId(i, j));
			// 		tr.append(cell);
			// 	});
			// 	boardElm.append(tr);
			// });

			// // CSS
			// // Change the columns layout
			// var colSize = String(100. / n) + '%';
			// var markSize = 12. * 3 / n; // 12vw is nice for a board of m columns
			// $('#board td').width(colSize);
			// console.log('done setting board width');
			// $('.subtable-cell').css('font-size', String(markSize) + 'vmin');
			// console.log('done setting cell marks');
		};

		this.bindMoves = function (board, controllerHotline) {
			$.each(board, function (i, row) {
				$.each(row, function (j, cell) {
					var cellId = encodeCellId(i, j);
					// console.log('binding', cellId);
					$('#' + cellId).click(function (argument) {
						if (controllerHotline.authorisedPlayer !== undefined &&
							controllerHotline.authorisedPlayer === controllerHotline.player.mark) {
							controllerHotline.player.resolve({
								x: i,
								y: j,
								mark: controllerHotline.player.mark
							});
							self.disableMoveInput(i, j); // deactivate after click
						}
						console.log('You clicked', cellId);
					});
				});
			});
		};

		this.disableMoveInput = function (x, y) {
			var cell = $('#' + encodeCellId(x, y))
			if (cell.length) {
				cell.off('click');
			} else {
				console.log('Failed to disable input on cell', x, y);
			}
		};

		this.renderMove = function (move) {
			var styles = renderMap[move.mark];
			if (!styles) {
				throw 'Invalid move' + String(styles);
			}
			var cellId = encodeCellId(move.x, move.y);
			$('#' + cellId)
				.find('.subtable-cell i')
				.addClass([styles.icon, styles.text].join(' '))
				.toggleClass('hidden');
		};

		this.renderBoardAscii = function (board, status) {
			var m = board.length;
			var n = board[0].length;

			var asciiMap = {
				0: 'x',
				1: 'o',
				2: 'v',
				3: 'i'
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
					return asciiMap[player] || String(player);
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
			self.renderBoardAscii(model.board, status);
			// self.renderBoard(model.board, status);
			console.log('\n');
		};
	})();

	var controller = new (function (model, view) {
		var model = model;
		var view = view;
		var waitTimeBetweenMoves = 500;
		var inputHotline = {
			on: function () {
					console.log('hotline on');
					if (model.currentPlayer instanceof HumanPlayer) {
						inputHotline.authorisedPlayer = model.currentPlayer.getMark();
					}
				},

			off: function () {
					console.log('hotline off');
					for (var k in inputHotline) {
						if (['on', 'off'].indexOf(k) === -1) {
							delete inputHotline[k];
						}
					}
				},
		};

		model.init();
		var self = this;

		function updateBoard(move) {
			view.renderMove(move);
			return new Promise(function(resolve, reject) {
				model.board[move.x][move.y] = move.mark;
				if(model.humanIsPlaying()) {
					view.disableMoveInput(move.x, move.y);
				}
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

		function nexPlayerMark (currentPlayerMark) {
			return (currentPlayerMark+1) % model.players.length;
		}

		function gameEnded () {
			var result = TicTacToe.checkGameStatus({
				board: model.board, 
				cellsToWin: model.cellsToWin,
				next: nexPlayerMark
			});
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

		function waitForMove () {
			// wrapper around users' move
			// to enable input channel

			var playerIsHuman = model.currentPlayer instanceof HumanPlayer;

			if (playerIsHuman) {
				inputHotline.on();
			}

			var moved = model.currentPlayer.makeAMove({
				board: model.board, 
				cellsToWin: model.cellsToWin,
				next: nexPlayerMark,
				hotline: inputHotline
			});

			return new Promise(function (resolve, reject) {
				moved.then(function (move) {
					if (playerIsHuman) {
						inputHotline.off();
					}
					resolve(move);
				});
			});
		}

		this.gameOn = function () {

			waitForMove()
				.then(updateBoard)
				.then(function (argument) {
					if (gameEnded()) {
						return;
					}
					model.currentPlayer = getNextPlayer(model.currentPlayer);
					setTimeout(self.gameOn, waitTimeBetweenMoves);
					// self.gameOn();
				})
				.catch(function (error) {
					console.log(error);
				})
				;
		};

		this.initView = function () {
			view.renderBoard(model.board);

			// only allow inputs when a human is playing
			if (model.humanIsPlaying()) {
				view.bindMoves(model.board, inputHotline);
			}
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
		controller.initView();
		console.log(model);
		console.assert(model.rows === 3 && model.cols === 3);
		console.assert([0, 1].indexOf(model.currentPlayer.getMark()) !== -1);
		controller.gameOn(model.firstPlayer);
		// controller.takeTurn();
		CONTROLLER = controller;
	})();
});