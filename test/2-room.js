import Room from '../lib/room.js';
import http from '../node_modules/http/index.js';

//var body = http.createBody();

export function suite(add){
	add('add(stream)', function(){

	});

	add('add(stream) when user limit is reached', function(){

	});

	add('add(stream) when isDisabled', function(){

	});

	add('add(stream) write in the stream', function(){

	});

	add('add(stream, lastEventId) with lastEventId send event history', function(){

	});

	add('add(stream) will remove(stream) when stream is closed', function(test){

	});

	add('remove() prevent stream from getting more events but does not close the stream', function(){

	});

	add('disable() close all stream, clear history & prevent to add new stream', function(){

	});

	add('first add() open the room', function(){

	});

	add('last remove() close the room', function(){

	});

	add('keepAlive event are written', function(){

	});
}