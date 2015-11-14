import proto from 'proto';

var EventHistory = proto.extend({
	// event id can collide if 1 billion of event have occured between
	// an eventsource client is disconnected and reconnected -> it will never happen
	maxId: Math.pow(10, 9),
	autoId: false,

	constructor(limit, autoId){
		this.events = [];
		
		this.limit = limit;
		this.autoId = autoId;
		this.lastId = 0;
	},
	
	get size(){
		return this.events.length;
	},

	indexOf(sourceEventId){
		return this.events.findIndex(function(sourceEvent){
			return sourceEvent.hasOwnProperty('id') && sourceEvent.id == sourceEventId;
		});
	},

	nextId(){
		if( this.lastId >= this.maxId ){
			this.lastId = 0;
		}

		this.lastId++;

		return this.lastId;
	},

	add(sourceEvent){
		if( this.autoId && false === sourceEvent.hasOwnProperty('id') ){
			sourceEvent.id = this.nextId();
		}
		
		if( this.events.length >= this.limit ){
			this.events.shift();
		}
		
		this.events.push(sourceEvent);
	},

	has(sourceEventId){
		return this.indexOf(sourceEventId) > -1;
	},

	since(sourceEventId){
		var index = this.indexOf(sourceEventId);
		return index < 0 ? [] : this.events.slice(index + 1);
	},

	clear(){
		this.events.length = 0;
	}
});

export default EventHistory;
