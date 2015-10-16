import proto from 'proto';

var IterableIncrementedId = proto.extend({
	min: Number.MIN_VALUE,
	max: Number.MAX_VALUE,
	
	constructor(added){
		this.added = 1; // can be -1, 1, 2, 10
		this.reset();
	},
	
	reset(){
		this.count = 0;
		this.gap = 0;
	},
	
	indexOf(id){
		return id - this.gap;
	},
	
	shift(id){
		this.gap+= this.added;		
	},
	
	next(){
		if( this.count >= this.max ){
			this.reset();
		}
		
		this.count+= this.added;
		return this.count;
	},
	
	[Symbol.iterator](){
		// todo
	}
});

var EventHistory = proto.extend({
	// event id can collide if 1 billion of event have occured between
	// an eventsource client is disconnected and reconnected -> it will never happen
	maxId: Math.pow(10, 9),

	constructor: function(limit, autoIncrementId){
		this.events = [];
		
		this.limit = limit;
		this.autoIncrementId = autoIncrementId;
		if( this.autoIncrementId ){
			this.iterableId = IterableIncrementedId.create();
			this.iterableId.max = this.maxId;
		}
	},
	
	get size(){
		return this.events.length;
	},

	add: function(sourceEvent){
		if( this.autoIncrementId ){
			sourceEvent.id = this.iterableId.next();
		}
		
		if( this.events.length >= this.limit ){
			if( this.autoIncrementId ){
				this.iterableId.shift();
			}
			this.events.shift();
		}
		
		this.events.push(sourceEvent);
	},

	has: function(sourceEvent){
		return this.events.indexOf(event) > -1;
	},

	since: function(sourceEventId){
		var id;
		
		if( typeof sourceEventId === 'object' ){
			id = sourceEventId.id;
		}
		else if( typeof sourceEventId === 'string' ){
			if( isNaN(id) ){
				throw new TypeError('history.since() expect a number');
			}
			id = parseInt(sourceEventId);
		}
		else{
			id = sourceEventId;
		}
		
		var index = this.iterableId.indexOf(id);

		return index < 0 ? [] : this.events.slice(index);
	},

	clear: function(){
		this.events.length = 0;
	}
});

export default EventHistory;
