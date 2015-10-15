import proto from 'proto';

var EventHistory = proto.extend({
	constructor: function(limit){
		this.events = [];
		this.size = 0;
		this.removedCount = 0;
		this.limit = limit;
	},

	add: function(sourceEvent){
		this.events[this.size] = sourceEvent;

		if( this.size >= this.limit ){
			this.events.shift();
			this.removedCount++;
		}
		else{
			this.size++;
		}
	},

	has: function(sourceEvent){
		return this.events.indexOf(event) > -1;
	},

	since: function(index){
		index = parseInt(index);
		if( isNaN(index) ){
			throw new TypeError('history.since() expect a number');
		}
		index-= this.removedCount;
		return index < 0 ? [] : this.events.slice(0, index);
	},

	clear: function(){
		this.events.length = 0;
		this.size = 0;
		this.removedCount = 0;
	}
});

export default EventHistory;