/* global URLSearchParams */

import proto from 'proto';

import EventRoom from './room.js';

import http from '../node_modules/@dmail/http/index.js';

var EventSourceService = proto.extend({
	constructor: function(options){
		this.room = EventRoom.create(options);
		Object.assign(this, options);
	},

	acceptEventStream(accept){
		// it's more complicated in case accept headers are multiple
		return accept === 'text/event-stream';
	},

	validateRequest(request){
		return true;
	},

	checkRequestValidity(request){
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
			var searchParams = new URLSearchParams(request.url.search);
			if( searchParams.has('lastEventId') ){
				lastEventId = searchParams.get('lastEventId');
			}
		}

		return lastEventId;
	},

	createResponseBody(){
		return http.createBody();
	},

	serveRequest(request){
		if( this.checkRequestValidity(request) ){
			var responseProperties, stream = this.createResponseBody();

			// request.socket.setNoDelay(true); // not needed, or if it is needed put it inside transport-process of http
			// virer le responseProperties de add
			// il faut gérer virer le spécifique de add et le mettre ici
			try{
				if( this.room.add(stream, this.getRequestLastEventId(request)) ){
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
				else{
					// no content
					responseProperties = {
						status: 204
					};
				}
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

			return responseProperties;
		}
	},

	get(){
		return this.serveRequest.bind(this);
	}
});

export default EventSourceService;