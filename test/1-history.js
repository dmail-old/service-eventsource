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

		test.equal(history.since(1).join(''), 'bc');
		test.equal(history.since(2).join(''), 'c');

		history.add('d');

		test.equal(history.since(2).join(''), 'cd');
	});

	add('clear', function(test){
		var history = History.create(3);

		history.add('a');
		history.clear();

		test.equal(history.size, 0);
	});

	add('autoIncrementId', function(test){
		var history = History.create(10, true);

		history.maxId = 2;
		var firstSourceEvent = {name: 'first'};
		var secondSourceEvent = {name: 'second'};
		var thirdSourceEvent = {name: 'third'};

		history.add(firstSourceEvent);
		history.add(secondSourceEvent);
		history.add(thirdSourceEvent);

		test.equal(firstSourceEvent.id, 1);
		test.equal(secondSourceEvent.id, 2);
		test.equal(thirdSourceEvent.id, 1);

		// since second only third happened		
		test.equal(history.since(secondSourceEvent)[0], thirdSourceEvent);
		// because we added 3 events and maxId is 2
		// the result returned by history.since(firstSourceEvent) states
		// that secondSourceEvent happened after third but it's the expected behaviour
		// because maxId will be very high this case will never happen
		// considering the fact history.since will be called by a client trying to reconnect
		// and client reconnection can occur between a min
		// sou you need to send 1 000 000 000 event in less than 60 s to reproduce this behaviour
		test.equal(history.since(thirdSourceEvent)[0], secondSourceEvent);

	});
}