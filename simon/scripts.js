function randint(n) {
	return Math.floor(Math.random() * n);
};

var model = {
	sequenceLength: 20,
	sequence: [],

	get sequence() {
		return this.sequence;
	},

	set sequence(s) {
		this.sequence = s;
	}
};

var view = new (function () {

})();

var controller = new (function () {

})();