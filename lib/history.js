import proto from 'proto';

var EventHistory = proto.extend({
	// event id can collide if 1 billion of event have occured between
	// an eventsource client is disconnected and reconnected -> it will never happen
	maxId: Math.pow(10, 9),

	constructor: function(limit, autoIncrementId){
		this.events = [];
		this.size = 0;
		
		this.limit = limit;
		this.autoIncrementId = autoIncrementId;
		this.idGap = 0;
		this.lastEventId = 0;
	},

	add: function(sourceEvent){
		if( this.autoIncrementId ){		
			if( this.lastEventId >= this.maxId ){
				this.lastEventId = 0;
				this.idGap = 0;
			}
			this.lastEventId++;
			sourceEvent.id = this.lastEventId;
		}

		this.events[this.size] = sourceEvent;
		if( this.size >= this.limit ){
			this.events.shift();
			this.idGap++;
		}
		else{
			this.size++;
		}
	},

	has: function(sourceEvent){
		return this.events.indexOf(event) > -1;
	},

	since: function(id){
		if( typeof id === 'object' ){
			id = id.id;
		}
		if( typeof id === 'string' ){
			id = parseInt(id);
		}

		if( isNaN(id) ){
			throw new TypeError('history.since() expect a number');
		}
		id-= this.idGap;

		return id < 0 ? [] : this.events.slice(id);
	},

	clear: function(){
		this.events.length = 0;
		this.size = 0;
		this.idGap = 0;
	}
});

export default EventHistory;