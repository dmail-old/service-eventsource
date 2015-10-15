import History from '../lib/history.js';

export function suite(add){
	add('add', function(test){
		var history = History.create(1);

		history.add('foo');
		test.equal(history.size, 1);
		history.add('bar');
		test.equal(history.size, 1);
	});

	add('since', function(test){
		var history = History.create(3);

		var eventA = 'a', eventB = 'b', eventC = 'c';

		history.add(eventA);
		history.add(eventB);
		history.add(eventC);

		test.equal(history.since(3).join(''), 'abc');
		test.equal(history.since(2).join(''), 'ab');

		history.add('d');

		test.equal(history.since(4).join(''), 'bcd');
	});

	add('clear', function(test){
		var history = History.create(3);

		history.add('a');
		history.clear();

		test.equal(history.size, 0);
	});
}