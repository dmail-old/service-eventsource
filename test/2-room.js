import SourceEvent from '../lib/source-event.js';

export function suite(add){
	add('add() create valid response properties', function(){

	});

	add('add() when user limit is reached', function(){

	});

	add('add() produce a body stream that is auto removed when body is closed', function(){

	});

	// first add will open anyway so closed state is not right
	// maybe a disabled stats with disable()
	/*
	add('add() when state is closed', function(){

	});
	*/

	add('add() with lastEventId sent event history', function(){

	});

	add('remove() prevent stream from getting more events but does not close the stream', function(){

	});

	add('close() will close all stream and clear history', function(){

	});

	add('first add() open the room', function(){

	});

	add('last remove() close the room', function(){

	});

	add('keepAlive event are sent', function(){

	});

	add('serveRequest read request headers, params and call handleRequest to check if stream must be added', function(){

	});
}