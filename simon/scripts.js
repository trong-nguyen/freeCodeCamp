function randint(n) {
	return Math.floor(Math.random() * n);
};

function generateRandomArray(size, cap) {
	return Array(size).fill().map(function () {
		return randint(cap);
	});
};

var model = {
	// sequenceLength: 20,
	sq: [],
	buttons: 4,

	get sequence() {
		return this.sq;
	},

	set sequenceLength(size) {
		if (size > 0) {
			// if (this.sq.length !== size) {
				this.sq = generateRandomArray(size, this.buttons);
			// }
		} else {
			throw 'Invalid sequence size';
		}
	}
};

var view = new (function () {

})();

var controller = new (function () {

})();