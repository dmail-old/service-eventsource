import History from '../lib/history.js';

export function suite(add){
	add('add', function(test){
		var history = History.create(1);

		history.add('foo');
		test.equal(history.size, 1);
		history.add('bar');
		test.equal(history.size, 1);
	});

	add('indexOf', function(test){
		var history = History.create();

		var eventA = {id: 'a'}, eventB = {id: 'b'}, eventC = {id: null};

		history.add(eventA);
		history.add(eventB);
		history.add(eventC);

		test.equal(history.indexOf(eventA.id), 0);
		test.equal(history.indexOf(eventB.id), 1);
		test.equal(history.indexOf(null), 2);
		test.equal(history.indexOf('foo'), -1);
	});

	add('autoId will create an id for event added without id', function(test){
		var history = History.create(10, true);
		var eventA = {};

		history.add(eventA);
		test.equal(eventA.id, 1);
	});

	add('autoId will not set an id when event already got an id', function(test){
		var history = History.create(10, true);
		var eventA = {id: 'a'};

		history.add(eventA);
		test.equal(eventA.id, 'a');
	});

	add('when maxId is reached the event id can collides', function(test){
		var history = History.create(10, true);
		history.maxId = 1;
		var eventA = {};
		var eventB = {};

		history.add(eventA);
		history.add(eventB);

		// because we added 2 event without id and maxId is 1
		// the result returned by history.indexOf(thirdSourceEvent.id) states
		// that thirdSourceEvent is at index 0 but it's the expected behaviour
		// because maxId will be very high this case will never happen
		// considering the fact history.since will be called by a client trying to reconnect
		// and client reconnection can occur between a min
		// sou you need to send 1 000 000 000 event in less than 60 s to reproduce this behaviour
		test.equal(eventA.id, eventB.id);
	});

	add('since', function(test){
		var history = History.create(3, true);

		var eventA = {}, eventB = {}, eventC = {}, eventD = {};

		history.add(eventA);
		history.add(eventB);
		history.add(eventC);

		test.match(history.since(eventA.id), [eventB, eventC]);
		test.match(history.since(eventB.id), [eventC]);

		history.add(eventD);

		test.match(history.since(eventB.id), [eventC, eventD]);
	});

	add('clear', function(test){
		var history = History.create(3);

		history.add('a');
		history.clear();

		test.equal(history.size, 0);
	});
}