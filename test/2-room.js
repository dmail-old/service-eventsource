import Room from '../lib/room.js';
import http from '../node_modules/@dmail/http/index.js';

export function suite(add){
	add('add(stream) returns true', function(test){
		var room = Room.create();
		var stream = http.createBody();

		test.equal(room.add(stream), true);
	});

	add('add(stream) when user limit is reached', function(test){
		var room = Room.create({
			maxLength: 0
		});
		var stream = http.createBody();
		var addPromise = new Promise(function(resolve){
			resolve(room.add(stream));
		});

		return test.rejectWith(addPromise, {name: 'RangeError'});
	});

	add('add(stream) returns false when toom isDisabled', function(test){
		var room = Room.create();
		var stream = http.createBody();

		room.disable();

		test.equal(room.add(stream), false);
	});

	add('add(stream) write a join event in the stream', function(test){
		var room = Room.create();
		var stream = http.createBody();

		room.retryDuration = 10;
		room.add(stream);
		stream.close();

		return test.resolveWith(stream.readAsString(), 'retry:10\nevent:join\ndata:');
	});

	add('added stream receive event when calling room.sendEvent()', function(test){
		var room = Room.create();
		var firstStream = http.createBody();
		var secondStream = http.createBody();

		room.add(firstStream);
		room.add(secondStream);

		room.sendEvent('foo', 'bar');

		firstStream.close();
		secondStream.close();

		return Promise.all([
			test.resolveWith(firstStream.readAsString(), 'event:foo\ndata:bar\n\n'),
			test.resolveWith(secondStream.readAsString(), 'event:foo\ndata:bar\n\n')
		]);
	});

	add('add(stream, lastEventId) with lastEventId send event history', function(test){

	});

	add('add(stream) will remove(stream) when stream is closed', function(test){

	});

	add('remove() prevent stream from getting more events but does not close the stream', function(test){

	});

	add('disable() close all stream, clear history & prevent to add new stream', function(test){

	});

	add('first add() open the room', function(test){

	});

	add('last remove() close the room', function(test){

	});

	add('keepAlive event are written', function(test){

	});
}