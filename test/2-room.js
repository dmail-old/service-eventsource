import rest from '../node_modules/@dmail/rest/index.js';

import Room from '../lib/room.js';

export function suite(add){
	add('add(stream) returns true', function(){
		var room = Room.create();
		var stream = rest.createBody();

		this.equal(room.add(stream), true);
	});

	add('add(stream) when user limit is reached', function(){
		var room = Room.create({
			maxLength: 0
		});
		var stream = rest.createBody();
		var addPromise = new Promise(function(resolve){
			resolve(room.add(stream));
		});

		return this.rejectWith(addPromise, {name: 'RangeError'});
	});

	add('add(stream) returns false when room isDisabled', function(){
		var room = Room.create();
		var stream = rest.createBody();

		room.disable();

		this.equal(room.add(stream), false);
	});

	add('add(stream) write a join event in the stream', function(){
		var room = Room.create({
			autoIncrementId: false
		});
		var stream = rest.createBody();

		room.retryDuration = 10;
		room.add(stream);
		stream.close();

		return this.resolveWith(stream.readAsString(), 'retry:10\nevent:join\ndata:');
	});

	add('added stream receive event when calling room.sendEvent()', function(){
		var room = Room.create();
		var firstStream = rest.createBody();
		var secondStream = rest.createBody();

		room.add(firstStream);
		room.add(secondStream);

		room.sendEvent('foo', 'bar');

		firstStream.close();
		secondStream.close();

		return Promise.all([
			this.resolveWith(firstStream.readAsString(), 'event:foo\ndata:bar\n\n'),
			this.resolveWith(secondStream.readAsString(), 'event:foo\ndata:bar\n\n')
		]);
	});

	add('add(stream, lastEventId) with lastEventId send event history', function(){

	});

	add('add(stream) will remove(stream) when stream is closed', function(){

	});

	add('remove() prevent stream from getting more events but does not close the stream', function(test){

	});

	add('disable() close all stream & clear history', function(){

	});

	add('first add() open the room', function(){

	});

	add('last remove() close the room', function(){

	});

	add('keepAlive event are written', function(){

	});
}