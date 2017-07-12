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
		this.rows = 3;
		this.cols = 3;
		this.cellsToWin = 3;
		this.board = null;
		this.currentPlayer = null;
		this.players = ['AI', 'AI'];
		this.gameScore = null;
		this.firstPlayer = null;
		var humanPlaying = false;

		var self = this;

		function setFirstPlayer(index) {
			self.firstPlayer = self.players[index];
		}

		function resetScores() {
			self.gameScore = {};
			self.players.forEach(function(player){
				self.gameScore[player.getMark()] = 0;
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
			self.currentPlayer = self.firstPlayer;
		};

		this.resetMatch = function () {
			self.resetGame();
			resetScores();
		};
	})();

	var view = new (function () {
		var boardElm = $('#board');
		var statusFeedElm = $('#game-status');
		var scoreStatusElms = [$('#score-p0'), $('#score-p1')];
		var cellTemlate = boardElm.find('tr').first().clone();

		var renderMap = {
			0: {
				icon: 'fa-times',
				text: 'text-success',
				status: 'alert-danger',
			},
			1: {
				icon: 'fa-circle-o',
				text: 'text-danger',
				status: 'alert-success',
			}
		};

		var self = this;
		this.display = function (what) {
			console.log(what);
		};

		function encodeCellId(x, y) {
			return  String(x) + '-' + String(y);
		}

		function decodeCellId(id) {
			return id.split('-').map(Number);
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


			// THE FOLLOWING LINES ARE HIGLY COUPLED WITH encodeCellId
			// MUST BE CHANGED ON CHANGIN that as well
			var templateString = cellTemlate.html()
				.replace('id=""', 'id="" ' + tdStyle)
				.replace('class="subtable-cell hidden"', 'class="subtable-cell hidden" ' + markStyle);
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
			boardElm.empty();
			boardElm.html(table.join('\n'))
			// END OF COUPLED LINES

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
			// $('.subtable-cell').css('font-size', String(markSize) + 'vmin');
		};

		this.enableUserInput = function (controllerHotline) {
			boardElm.on('click', function (event) {
				function findId(e) {
					// keep going up one level to find the cell id
					// this works or not depending on the html markup
					var level = 10;
					var node = e;
					while (level--) {
						if (node.id) {
							return node.id;
						} else {
							node = node.parentNode;
						}
					}
				}
				var cellId = findId(event.target);
				console.log('clicked', cellId);
				try {
					var xy = decodeCellId(cellId);
				} catch (error) {
					console.log(error);
					throw 'Invalid click event on' + String(event.target);	
				}

				if (!controllerHotline.validate({x: xy[0], y: xy[1]})) {
					return;
				}

				if (controllerHotline.authorisedPlayer !== undefined &&
					controllerHotline.authorisedPlayer === controllerHotline.player.mark) {
					controllerHotline.player.resolve({
						x: xy[0],
						y: xy[1],
						mark: controllerHotline.player.mark
					});
				}
			});
		};

		this.disableUserInput = function () {
			boardElm.off();
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

		this.displaySettledResult = function (result, score, callback) {
			function highlightWinningLine (line) {
				line.forEach(function (xy) {
					var x = xy[0], y = xy[1];
					$('#' + encodeCellId(x, y)).addClass('won-cell');
				});
			}

			if (result.status === 'draw') {
				self.displayStatus(result);
			} else if (result.status === 'won') {
				result.player = result.winner;
				self.displayStatus(result);
				highlightWinningLine(result.line);
				self.updateScore(score);
			}

			boardElm.one('click', function (argument) {
				callback();
			});
		};

		this.displayStatus = function (result) {
			function removeStyles() {
				statusFeedElm.removeClass('alert-info alert-success alert-danger');
			}
			removeStyles();
			if (result.status === 'unsettled') {
				statusFeedElm.addClass(renderMap[result.player].status);
				statusFeedElm.text('Game started! Player ' + (Number(result.player) + 1) + "'s turn");
			} else if (result.status === 'draw') {
				statusFeedElm.addClass('alert-info');
				statusFeedElm.text('Draw! Click board to continue!')
			} else if (result.status === 'won') {
				statusFeedElm.addClass('alert-info');
				statusFeedElm.text('Player ' + result.player + ' won! Click board to continue!');
			}
		};

		this.updateScore = function (score) {
			for (var k in scoreStatusElms) {
				scoreStatusElms[k].text(score[k]);
			}
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
					inputHotline.authorisedPlayer = model.currentPlayer.getMark();
					view.enableUserInput(inputHotline);
				},

			off: function () {
					console.log('hotline off');
					for (var k in inputHotline) {
						if (['on', 'off', 'validate'].indexOf(k) === -1) {
							delete inputHotline[k];
						}
					}
					view.disableUserInput();
				},
			validate: function (move) {
				var x = move.x, y = move.y;
				return (
					x >= 0 && x < model.rows
					&& y >= 0 && y < model.cols
					&& model.board[x][y] === CONSTANTS.UNOCCUPIED
				);
			}
		};

		model.init();
		var self = this;

		function updateBoard(move) {
			view.renderMove(move);
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

		function nextPlayerMark (currentPlayerMark) {
			return (currentPlayerMark+1) % model.players.length;
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
				next: nextPlayerMark,
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
		
		function continueOrReset () {
			var result = TicTacToe.checkGameStatus({
				board: model.board, 
				cellsToWin: model.cellsToWin,
				next: nextPlayerMark
			});

			var settled = result.status !== 'unsettled';

			if (result.status === 'won') {
				model.gameScore[result.winner] += 1;
			}

			return new Promise (function (resolve, reject) {
				result.player = model.currentPlayer.getMark();

				function cleanup() {
					model.resetGame();
					self.initView();
					resolve(result);
				}

				if (settled) {
					view.displaySettledResult(result, model.gameScore, cleanup);
				} else {
					model.currentPlayer = getNextPlayer(model.currentPlayer);
					resolve(result);
				}
			});
		}

		this.gameOn = function () {				
			waitForMove()
				.then(updateBoard)
				.then(continueOrReset)
				.then(view.displayStatus)
				.catch(function (error) {
					console.log(error);
				})
				.then(function (argument) {
					setTimeout(self.gameOn, waitTimeBetweenMoves);
				})
				;

		};

		this.initView = function () {
			view.renderBoard(model.board);
		};

		this.setup = function () {
			$('#game-setup').modal('show');
			return new Promise (function (resolve, reject) {

			});
		};

	})(model, view);

	// (function init () {
	// 	controller.startGame();
	// 	controller.gameOn();
	// })();
	(function test() {
		controller.setup()
			.then(function (argument) {
				controller.startGame();
				controller.initView();
				console.log(model);
				console.assert(model.rows === 3 && model.cols === 3);
				console.assert([0, 1].indexOf(model.currentPlayer.getMark()) !== -1);
				controller.gameOn(model.firstPlayer);
				// controller.takeTurn();
				CONTROLLER = controller;
			});
	})();
});