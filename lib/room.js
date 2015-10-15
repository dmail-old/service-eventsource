import proto from 'proto';

import EventHistory from './history.js';
import SourceEvent from './source-event.js';

// https://github.com/nodejs/node-v0.x-archive/issues/9066
// in other words : server.close() must close manually the opened connections
// in order to close the room efficiently
var EventRoom = proto.extend({
	keepaliveDuration: 30000,
	retryDuration: 1000,
	historyLength: 1000,
	maxLength: 100, // max 100 users accepted
	isDisabled: false,

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
		this.state = 'closed';
	},

	disable: function(){
		if( false === this.isDisabled ){
			// close every stream
			this.streams.forEach(function(stream){
				stream.close();
			});
			this.history.clear();
			this.streams.length = 0;
			this.isDisabled = true;
		}
	},

	enable: function(){
		if( this.isDisabled ){
			this.isDisabled = false;
		}
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

	add: function(stream, lastEventId){
		if( this.streams.length > this.maxLength ){
			throw new RangeError('too much stream');
		}
		else if( this.isDisabled ){
			return false;
		}
		else{
			if( this.streams.length === 0 ){
				this.open();
			}

			// send events which occured between lastEventId & now
			if( lastEventId ){
				stream.write(this.history.since(lastEventId).join(''));
			}

			var joinEvent = this.createEvent('join', new Date());
			joinEvent.retry = this.retryDuration;

			stream.write(this.generate(joinEvent));

			this.streams.push(stream);

			// lorsque response est closed, on ne peut plus écrire dedans
			stream.then(function(){
				this.remove(stream);
			}.bind(this));

			return true;
		}
	},

	remove: function(stream){
		this.streams.splice(this.streams.indexOf(stream), 1);
		if( this.streams.length === 0 ){
			this.close();
		}
	}
});

export default EventRoom;