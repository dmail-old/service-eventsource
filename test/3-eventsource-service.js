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
		var eventSourceService = EventSourceService.create({
			validateRequest(request){
				return true;
			}
		});
		eventSourceService.validateRequest = this.spy(eventSourceService.validateRequest);

		var rest = Rest.create();
		var requestAcceptingEventStream = rest.createRequest({
			headers: {
				'accept': 'text/event-stream'
			}
		});

		rest.use(eventSourceService);

		return rest.findServiceMatch(requestAcceptingEventStream).then(function(service){
			this.calledWith(eventSourceService.validateRequest, requestAcceptingEventStream);
			this.match(service, eventSourceService);
		}.bind(this));
	});

	add('getRequestLastEventId()', function(){
		// read last-event-id from search params or from headers

		var requestWithLastEventIdInHeaders = Rest.createRequest({
			headers: {
				'last-event-id': 10
			}
		});
		var requestWithLastEventIdInUrlSearchParams = Rest.createRequest({
			url: '?lastEventId=5'
		});

		this.equal(EventSourceService.getRequestLastEventId(requestWithLastEventIdInHeaders), 10);
		this.equal(EventSourceService.getRequestLastEventId(requestWithLastEventIdInUrlSearchParams), 5);
	});

	add('serveRequest(request) returns 503 for limit reached', function(){

	});

	add('serveRequest(request) returns 204 when room is disabled', function(){

	});

	add('serveRequest(request) returns 200 with right headers when all is fine', function(){

	});

}