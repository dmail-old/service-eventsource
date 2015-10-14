import proto from 'proto';

import EventHistory from './history.js';
import SourceEvent from './source-event.js';

var EventRoom = proto.extend({
	keepaliveDuration: 30000,
	retryDuration: 1000,
	historyLength: 1000,
	maxLength: 100, // max 100 users accepted

	constructor: function(options){
		Object.assign(this, options);

		this.connections = [];
		this.history = EventHistory.create(this.historyLength);
		this.lastEventId = 0;
		this.state = 'closed';
	},

	open: function(){
		this.interval = setInterval(this.keepAlive.bind(this), this.keepaliveDuration);
		this.state = 'opened';
	},

	close: function(){
		// it should close every connection no?
		clearInterval(this.interval);
		this.history.clear();
		this.state = 'closed';
	},

	write: function(data){
		this.connections.forEach(function(connection){
			connection.write(data);
		});
	},

	createEvent: function(type, data){
		return SourceEvent.create(type, data);
	},

	sendEvent: function(type, data){
		return this.send(this.createEvent(type, data));
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

	keepAlive: function(){
		var keepAliveEvent = this.createEvent('comment', new Date());
		this.send(keepAliveEvent);
	},

	add: function(request, lastEventId){
		var responseProperties;

		if( this.connections.length === 0 ){
			this.open();
		}

		if( this.connections.length > this.maxLength ){
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
			var body;
			// send events which occured between lastEventId & now
			if( lastEventId ){
				body = this.history.since(lastEventId).join('');
			}
			else{
				body = '';
			}

			var joinEvent = this.createEvent('join', new Date());
			joinEvent.retry = this.retryDuration;
			body+= this.generate(joinEvent);

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

	remove: function(connection){
		this.connections.splice(this.connections.indexOf(connection), 1);
		if( this.connections.length === 0 ){
			this.close();
		}
	}
});

function createEventSourceService(options, match){
	var room = EventRoom.create(options);

	// la fermeture du serveur devrait close la room faudra vérif que c'est bien le cas
	function eventSourceService(request){
		if( request.headers && request.headers.accept === 'text/event-stream' && match(request) ){
			var lastEventId;

			if( request.headers.has('last-event-id') ){
				lastEventId = request.headers.get('last-event-id');
			}
			else{
				var searchParams = new global.URLSearchParams(request.url.search);
				if( searchParams.has('lastEventId') ){
					lastEventId = searchParams.get('lastEventId');
				}
			}

			// request.socket.setNoDelay(true); // not needed, or if it is needed put it inside transport-process of http

			return room.add(request, lastEventId);
		}
	}

	function eventSourceMiddleware(request, response){
		room.connections.push(response);

		// lorsque response est closed, on ne peut plus écrire dedans
		response.then(function(){
			room.remove(response);
		});
	}

	return eventSourceService;
}

export default createEventSourceService;