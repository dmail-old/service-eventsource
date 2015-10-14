/* global URLSearchParams */

import proto from 'proto';

import EventHistory from './history.js';
import SourceEvent from './source-event.js';
import http from '../node_modules/http/index.js';

// https://github.com/nodejs/node-v0.x-archive/issues/9066
// in other words : server.close() must close manually the opened connections
// in order to close the room efficiently
var EventRoom = proto.extend({
	keepaliveDuration: 30000,
	retryDuration: 1000,
	historyLength: 1000,
	maxLength: 100, // max 100 users accepted

	constructor: function(options){
		Object.assign(this, options);

		this.streams = [];
		this.history = EventHistory.create(this.historyLength);
		this.lastEventId = 0;
		this.state = 'closed';
	},

	open: function(){
		this.interval = setInterval(this.keepAlive.bind(this), this.keepaliveDuration);
		this.state = 'opened';
	},

	close: function(){
		clearInterval(this.interval);
		this.history.clear();
		this.state = 'closed';
		// close every stream
		this.streams.forEach(function(stream){
			stream.close();
		});
		this.streams.length = 0;
	},

	write: function(data){
		this.streams.forEach(function(stream){
			stream.write(data);
		});
	},

	generate: function(event){
		// dont store comment events
		if( event.type != 'comment' ){
			event.id = this.lastEventId;
			this.lastEventId++;
			this.history.add(event);
		}

		return String(event);
	},

	send: function(event){
		this.write(this.generate(event));
	},

	createEvent: function(type, data){
		return SourceEvent.create(type, data);
	},

	sendEvent: function(type, data){
		return this.send(this.createEvent(type, data));
	},

	keepAlive: function(){
		this.sendEvent('comment', new Date());
	},

	add: function(lastEventId){
		var responseProperties;

		if( this.streams.length === 0 ){
			this.open();
		}

		if( this.streams.length > this.maxLength ){
			responseProperties = {
				status: 503
			};
		}
		else if( this.state === 'closed' ){
			responseProperties = {
				status: 204
			};
		}
		else{
			var body = http.createBody();

			// send events which occured between lastEventId & now
			if( lastEventId ){
				body.write(this.history.since(lastEventId).join(''));
			}

			var joinEvent = this.createEvent('join', new Date());
			joinEvent.retry = this.retryDuration;
			
			body.write(this.generate(joinEvent));

			this.streams.push(body);
			// lorsque response est closed, on ne peut plus écrire dedans
			body.then(function(){
				this.remove(body);
			}.bind(this));

			responseProperties = {
				status: 200,
				headers: {
					'content-type': 'text/event-stream',
					'cache-control': 'no-cache',
					'connection': 'keep-alive'
				},
				body: body
			};
		}

		return responseProperties;
	},

	remove: function(stream){
		this.streams.splice(this.streams.indexOf(stream), 1);
		if( this.streams.length === 0 ){
			this.close();
		}
	},

	handleRequest: function(request){
		return true;
	},

	serveRequest: function(request){
		if( request.headers && request.headers.get('accept') === 'text/event-stream' && this.handleRequest(request) ){
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

			// request.socket.setNoDelay(true); // not needed, or if it is needed put it inside transport-process of http
			return this.add(request, lastEventId);
		}
	}
});

export default EventRoom;