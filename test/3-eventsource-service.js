import Rest from '../node_modules/@dmail/rest/index.js';

import EventSourceService from '../index.js';

export function suite(add){

	add("request must accept 'text/event-stream' in its headers to be matched", function(){
		var eventSourceService = EventSourceService.create();
		var rest = Rest.create();
		var requestAcceptingEventStream = rest.createRequest({
			headers: {
				'accept': 'text/event-stream'
			}
		});
		var requestAcceptingHTML = rest.createRequest({
			headers: {
				'accept': 'text/html'
			}
		});

		rest.use(eventSourceService);

		return Promise.all([
			this.resolveWith(rest.findServiceMatch(requestAcceptingEventStream), eventSourceService),
			this.resolveWith(rest.findServiceMatch(requestAcceptingHTML), null)
		]);
	});
	
	add('validateRequest() is used to know if request match', function(){
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