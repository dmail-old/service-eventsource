/* global URLSearchParams */

import proto from 'proto';

import rest from './node_modules/@dmail/rest/index.js';

import EventRoom from './lib/room.js';

var EventSourceService = proto.extend({
	constructor: function EventSourceService(options){
		this.room = EventRoom.create(options);
		Object.assign(this, options);
	},

	disable(){
		this.room.disable();
	},

	enable(){
		this.room.enable();
	},

	acceptEventStream(accept){
		// it's more complicated in case accept headers are multiple
		return accept === 'text/event-stream';
	},

	validateRequest(request){
		return true;
	},

	match(request){
		if( !request ){
			return false;
		}
		if( !request.headers ){
			return false;
		}
		if( !this.acceptEventStream(request.headers.get('accept')) ){
			return false;
		}
		if( !this.validateRequest(request) ){
			return false;
		}

		return true;
	},

	getRequestLastEventId(request){
		var lastEventId;

		if( request.headers.has('last-event-id') ){
			lastEventId = request.headers.get('last-event-id');
		}
		else{
			var searchParams = new URLSearchParams(request.url.search.slice(1));
			if( searchParams.has('lastEventId') ){
				lastEventId = searchParams.get('lastEventId');
			}
		}

		return lastEventId;
	},

	createResponseBody(){
		return rest.createBody();
	},

	methods: {
		get(request){
			var responseProperties, stream = this.createResponseBody();

			// request.socket.setNoDelay(true); // not needed, or if it is needed put it inside transport-process of http
			// virer le responseProperties de add
			// il faut gérer virer le spécifique de add et le mettre ici
			
			if( this.room.isDisabled ){				
				// no content
				responseProperties = {
					status: 204
				};
			}
			else{
				try{
					this.room.add(stream, this.getRequestLastEventId(request));

					responseProperties = {
						status: 200,
						headers: {
							'content-type': 'text/event-stream',
							'cache-control': 'no-cache',
							'connection': 'keep-alive'
						},
						body: stream
					};
				}
				catch(e){
					if( e.name === 'RangeError' ){
						// unauthorized
						responseProperties = {
							status: 503
						};
					}
					else{
						// internal server error
						responseProperties = {
							status: 500,
							body: e
						};
					}
				}
			}

			return responseProperties;
		}
	}
});

export default EventSourceService;