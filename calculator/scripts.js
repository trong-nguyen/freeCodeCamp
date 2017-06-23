$('document').ready(function() {
	var model = [];

	var view = new (function () {
		function round(num) {
			// to 2 decimal places
			var decimalPlace = 4;
			var c = Math.pow(10, decimalPlace);
			return Math.round(num * c) / c;
		}
		this.displayRes = function(what) {
			// console.log('pipeline', model);
			// console.log('\tresult', what);
			// stringifyChain();
			var convertible = parseFloat(what);
			var out = round(convertible) || what;
			// console.log(out);
			$('#input-field').html(out);
		};

		this.displayChain = function (chain) {
			var what = stringifyChain();
			// console.log('displayChain', what);
			$('#input-chain').html(stringifyChain());
		}
	})();

	function getRes() {
		return model[0].value;
	}

	function setRes(v) {
		model[0].value = v;
	}

	function stringifyChain() {
		var start = getRes() !== 0 ? 0 : 2;
		var array = model.slice(start);
		if (array.length) {
			return array
				.map(function(x) {
					return x.value;
				})
				.reduce(function(s, i) {
					return s+i;
				});
		}
	}

	var controller = new (function (model, view) {
		var model = model;
		var view = view;

		var self = this;

		function reserve() {
			model.push({type: 'number', value: 0});
			model.push({type: 'operator', value: '+'});
		}

		reserve();

		function pipeEmpty() {
			return model.length < 1;
		}

		this.enter = function (x) {
			var num = x.match(/^[0-9.]$/);
			if (num) {
				this.enterNumber(x);
				return;
			}

			var oper = x.match(/^[+-\\*\\/]$/);
			if (oper) {
				this.enterOperator(x);
				return;
			}
			
			if (x === 'ac') {
				this.clear();
				return;
			}

			if (x === '=') {
				this.calculate();
				return;
			}

			view.displayRes('Invalid input: ' + x);
		};

		this.enterNumber = function (num) {
			var head = model[model.length-1];
			if (head.type === 'operator') {
				model.push({type: 'number', value: num});
			} else {
				// apppend
				if (num === '.') {
					if (head.value.indexOf(num) === -1) {
						head.value += num;
					}
				} else {
					head.value += num;
				}
			}

			view.displayRes(model[model.length-1].value);
			view.displayChain();
		};

		this.enterOperator = function (oper) {
			var head = model[model.length-1];
			if (head.type === 'number') {
				model.push({type: 'operator', value: oper});
			} else {
				// override if re-entering operator after an operator
				head.value = oper;
			}
			view.displayChain();
		}

		this.clear = function () {
			model.splice(0, model.length);
			reserve();
			view.displayRes(0);
			view.displayChain();
		}

		this.calculate = function () {
			var res = getRes();

			for (var i=2; i<model.length; i+=2) {
				var v = parseFloat(model[i].value);
				var oper = model[i-1].value;
				switch (oper) {
					case '/': res /= v;
						break;
					case '*': res *= v;
						break;
					case '+': res += v;
						break;
					case '-': res -= v;
						break;
				};
			}

			self.clear();
			setRes(res);
			view.displayRes(res);
			view.displayChain();
		}


	})(model, view);

	function test() {
		console.assert(getRes() === 0, 'Expected initial result of 0');
		controller.enter('1');
		// stringifyChain();
		controller.enter('3');
		// stringifyChain();
		controller.enter('*');
		// stringifyChain();
		controller.enter('4');
		// stringifyChain();
		controller.calculate();
		console.assert(getRes() === 52, 'Expected result of 52');

		View = view;
		Model = model;
		Controller = controller;
	}
	// test();
	(function init() {
		'0123456789'.split('').forEach(function(num) {
			$('#num-' + num).click(function (argument) {
				controller.enter(num);
			});
		});

		var opers = {'mul': '*', 'div': '/', 'add': '+', 'sub': '-'};
		$.each(opers, function (k, v) {
			$('#oper-' + k).on('click', function (argument) {
				controller.enter(v);
			});
		});

		$('#ctrl-equal').on('click', function (argument) {
			controller.calculate();
		});

		$('#ctrl-ac').on('click', function (argument) {
			controller.clear();
		});

		$(document).keypress(function (e) {
			var pressable = '0123456789.+-*/=';
			var key = String.fromCharCode(e.which);
			if (pressable.indexOf(key) !== -1) {
				controller.enter(key);
			} else if (e.which === 13) {
				controller.calculate();
			}
		});

		$(document).keyup(function (e) {
			if ([8, 46].indexOf(e.keyCode) !== -1) {
				// delete [8-backspace, 46-delete] pressed
				controller.clear();
			}
		});
	})();
});