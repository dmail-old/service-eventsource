import History from '../lib/history.js';

export function suite(add){
	
	add('add', function(){
		var history = History.create(1);

		history.add('foo');
		this.equal(history.size, 1);
		history.add('bar');
		this.equal(history.size, 1);
	});

	add('indexOf', function(){
		var history = History.create();

		var eventA = {id: 'a'}, eventB = {id: 'b'}, eventC = {id: null};

		history.add(eventA);
		history.add(eventB);
		history.add(eventC);

		this.equal(history.indexOf(eventA.id), 0);
		this.equal(history.indexOf(eventB.id), 1);
		this.equal(history.indexOf(null), 2);
		this.equal(history.indexOf('foo'), -1);
	});

	add('autoId will create an id for event added without id', function(){
		var history = History.create(10, true);
		var eventA = {};

		history.add(eventA);
		this.equal(eventA.id, 1);
	});

	add('autoId will not set an id when event already got an id', function(){
		var history = History.create(10, true);
		var eventA = {id: 'a'};

		history.add(eventA);
		this.equal(eventA.id, 'a');
	});

	add('when maxId is reached the event id can collides', function(){
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
		this.equal(eventA.id, eventB.id);
	});

	add('since', function(){
		var history = History.create(3, true);

		var eventA = {}, eventB = {}, eventC = {}, eventD = {};

		history.add(eventA);
		history.add(eventB);
		history.add(eventC);

		this.match(history.since(eventA.id), [eventB, eventC]);
		this.match(history.since(eventB.id), [eventC]);

		history.add(eventD);

		this.match(history.since(eventB.id), [eventC, eventD]);
	});

	add('clear', function(){
		var history = History.create(3);

		history.add('a');
		history.clear();

		this.equal(history.size, 0);
	});
	
}