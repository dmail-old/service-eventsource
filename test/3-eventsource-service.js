import EventSourceService from '../lib/service.js';

export function suite(add){
	add('checkRequestValidity()', function(){
		// Room.create({validateRequest: function(){}})
	});

	add('getRequestLastEventId()', function(){
		// read last-event-id from search params or from headers
	});

	add('serveRequest(request) returns 503 for limit reached', function(){

	});

	add('serveRequest(request) returns 204 when room is disabled', function(){

	});

	add('serveRequest(request) returns 200 with right headers when all is fine', function(){

	});
}