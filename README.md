# Repo for [freeCodeCamp](https://www.freecodecamp.com) projects

## Front-end:
- [LocalWeather](localWeather/): display weather at current location, custom units
- [Wikipedia Feeds](wikipediaViewer/): display wikipedia feeds of random or entered topics.
- [TwitchTV Viewer](twitchViewer/): view streaming status from a prepopulated list of streamers, embedded preview capability if the streamer is online and streaming.
- [Calculator](calculator/): basic functionalities of a calculator, with keyboard-enabled entry.
- [Pomodoro Clock](pomodoro/): simple Pomodoro management clock, with custom configs for session and break time, pausing clock with keyboard buttons.

## Tictactoe - More than a game

### High-Level Structure
- Features:
	+ Unbeatable if played at classical mode - 3 x 3 board, 2 players, one is Computer.
	+ Multiplayer: 2 - 10 players, theoretically could be infinite, but highly unlikely.
	+ Player type configurable: could either be Human or Computer
	+ Board size customizable: capped at 100 x 100, at which it is already hard to follow.
	+ User-friendly setup diaglog
	+ It is cool just to look at the play-out between bots
	+ There is lots of room to improve Computer AI, adding strategies, counter algorithms, etc.

![Game Setup](http://i.imgur.com/eXxIuc2.png)
![Game playing](http://i.imgur.com/OfLcVBW.png)


- Using [MVC](https://softwareengineering.stackexchange.com/questions/234116/model-view-controller-does-the-user-interact-with-the-view-or-with-the-controll) pattern
```javascript
model = {
	data: ['boardData', 'playersData', 'currentGameStatus'],
	methods: [
		init: function (data) {
			constructInnerDataForBoardAndPlayers ();
		},
		reset: function () {
			resetGameStatus();
			resetScoreStatus();
		}
	],
};

view = {
	methods: [
		display: function () {
			renderBoard();
			renderMove();
			renderScores();
		},
		input: function () {
			collectInputsFromPlayers();
			passToController();
		}
		UI: function () {
			bindMethods(onConfigurationForms);
		}
	]
};

controller = {
	methods: [
		setupData: function () {
			collectInputsFromView();
			initModelAccordingToSetup();
		},
		administrateGamePlay: function () {
			askForPlayerMoves();
			updateGameStatus();
			askViewToRenderGameAndStatus();
			repeat();
		}
	]
}
```

- Minmax algorithm for 3x3 board size or there is less then 10 moves left, which makes outcomes predictable, efficiently.
```javascript
minmax: function (game, depth) {
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
	var playedOut = unoccupiedSlots.map(function (slot) {
		var newBoard = copyFillSlot(board, slot, player);
		newGame.board = newBoard;
		var score = scoreGame(newGame, player);

		if (score != null) {
			// Base case termination
			return [score+depth, slot];
		} else {
			var tic = TicTacToe.minmax(newGame, depth-1);
			return [-tic[0], slot];// their wins are my loss
		}
	});

	var bestMove = playedOut.reduce(function (a, p) {
		if (a[0] === p[0]) {
			// adding some random factor for equivalent choices
			return [a, p][randint(2)];
		}
		return a[0] > p[0] ? a : p;
	});
	return bestMove;
}
```

## Javascript Techniques

- [Dynamic viewport sized typography](https://css-tricks.com/viewport-sized-typography/): scaling font size according to meta defined viewport. Units of `vw` instead of `%` or `px`. ([additional](https://stackoverflow.com/questions/16056591/font-scaling-based-on-width-of-container/19814948#19814948))
- [Hide elements with hidden class](https://stackoverflow.com/questions/18568736/how-to-hide-element-using-twitter-bootstrap-3-and-show-it-using-jquery): `.addClass('hidden')`
- [Element append, the slow and fast ways](https://howchoo.com/g/mmu0nguznjg/learn-the-slow-and-fast-way-to-append-elements-to-the-dom): 
	+ Slow, but clean: naive jQuery append element by element
	+ Fast, but require fiddle: convert elements to html string and set html with / without html
	+ How big is the difference?: for 10000 elements, there would be a 10 times difference in rendering time
	+ Caveats of the "Fast" solution: you lose the bread and butter of jQuery, in this Tictactoe I have to manually incorporate css styles into element html.
- [jQuery event binding: .on, .off, .one](http://www.andismith.com/blog/2011/11/on-and-off/): conveninent bind event handlers to UI elements.
- [Event delagation](https://davidwalsh.name/event-delegate): an important mechansim to bind events efficiently. In tictactoe, instead of binding click events to all the available cells, which are huge in n by n problem, we only need to bind to the parent element and extract the event detail (which child element clicked) in the implementation.
- [Making responsive squares using table](https://stackoverflow.com/questions/20456694/grid-of-responsive-squares/20457076#20457076): for generic tabular data and layout, instead of using Bootstrap's grid system, which is limited by 12 columns denomination, consider use table with dynamic sizing.

![](https://i.stack.imgur.com/s0MqH.jpg)

- [Array copying](https://stackoverflow.com/questions/3978492/javascript-fastest-way-to-duplicate-an-array-slice-vs-for-loop): fastest ways are `while (i--) copy();` and `.slice(0, n)`
- `setTimeout(fn, waitTime)` is asynchronous: hence loops involved promises using `setTimeout` does not cause stackOverFlow. The function simply fires direction asynchrounously and return at the end of each iteration.
- ARIA stands for accessibility
- UX selection [rules of thumb](https://ux.stackexchange.com/questions/10728/dropdown-vs-radio-button), [more indept](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/):
	+ binary: checkbox
	+ 2-4 options: radios
	+ mostly text: radios
	+ many options: dropdown
	+ lots of options: dropdown with search

![](https://i.stack.imgur.com/3eDK3.png)

- [What does `this` could mean and do in JavaScript](https://stackoverflow.com/questions/13441307/how-does-the-this-keyword-in-javascript-act-within-an-object-literal): it is late binded, really late, as late as possible.
	+ Constructor: bounded object
	+ Method: the method's caller
	+ In events' handler: DOM element
	+ `call` or `apply`: the argument in the call
	+ Outside anything (and not in `strict` mode): global object (`window` on browsers)
	+ In arrow (`=>`) function: early bound to the object



## Chrome's performance analysis tool:
![Imgur](http://i.imgur.com/I0v2dft.png)
20 by 20 grid tic-tac-toe

## Control flow with Promises
Asynchronous programming are generally involved with Serial Flow and Parallel Flow. [Article here](https://colintoh.com/blog/staying-sane-with-asynchronous-programming-promises-and-generators.)
- Serial flow pattern: we have a set of tasks that need to be executed in order: one needs to be completed before another starts. For example, task B requires the data returned by task B, like the crop must be harvested before packaged, before the former enters execution.
- Parallel flow: in contrast, paralle flow does not care much about the order of execution, as long as they are executed.
In practice, the two patterns regularly intertwine, even in a single application.

## Computer Science
### Web developement overview
[Web development is different and better](https://www.oreilly.com/ideas/web-application-development-is-different-and-better)

### Architectural Patterns
[Patterns in archtectural design](https://en.wikipedia.org/wiki/Architectural_pattern)

### Module pattern
[Article](http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html)


## Algorithms:
### Roman conversions ([here](http://www.rapidtables.com/convert/number/how-number-to-roman-numerals.htm)): 
+ Read backward for Roman to Latin conversions.
+ Latin to Roman conversions involve the subtraction rule: remember roman numbers whether in subtraction form or not have at most 2 roman letters, and the preceding numeber can only be 10 or 5 times smaller. So consider the whole letters (I, X, C) and possible subtraction forms from them (IX, XC) or half letters (V, L and IV, XL) **AS unique primitives**. On converting to latin numbers, find the largest possible primitives (subtraction and non-subtraction forms) that equal or smaller than the remainder and subtract it.
+ Ancient Romans did not use roman numbers consistently, they wrote something as IIII or XIIX, i.e. add-until-enough and double-subtraction-form.

## Tools:
- Math rendering: [MathJax](https://www.mathjax.org/),
 [Katex](https://github.com/Khan/KaTeX)
- Form validation: [Bootstrap Validator](http://1000hz.github.io/bootstrap-validator/)