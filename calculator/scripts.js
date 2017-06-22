$('document').ready(function() {
	var model = [];

	var view = new (function () {
		this.display = function(what) {
			console.log('pipeline', model);
			console.log('\tresult', what);
		};
	})();

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

			view.display('Invalid input: ' + x);
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

			view.display(model[model.length-1].value);
		};

		this.enterOperator = function (oper) {
			var head = model[model.length-1];
			if (head.type === 'number') {
				model.push({type: 'operator', value: oper});
			} else {
				// override if re-entering operator after an operator
				head.value = oper;
			}
		}

		this.clear = function () {
			model.splice(0, model.length);
			reserve();
		}

		this.calculate = function () {
			var res = model[0];

			for (var i=2; i<model.length; i+=2) {
				var v = parseFloat(model[i].value);
				var oper = model[i-1].value;
				switch (oper) {
					case '/': res += res / v;
						break;
					case '*': res += res * v;
						break;
					case '+': res += res + v;
						break;
					case '-': res += res - v;
						break;
				};
			}

			self.clear();
			model[0].type = res;
			view.display(res);
		}


	})(model, view);

	View = view;
	Model = model;
	Controller = controller;

	function test() {
		controller.enter('1');
		controller.enter('3');
		controller.enter('*');
		controller.enter('4');
		controller.calculate();
	}
	test();
});