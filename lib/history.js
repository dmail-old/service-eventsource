import proto from 'proto';

var EventHistory = proto.extend({
	constructor: function(limit){
		this.events = [];
		this.size = 0;
		this.removedCount = 0;
		this.limit = limit;
	},

	add: function(data){
		this.events[this.size] = data;

		if( this.size >= this.limit ){
			this.events.shift();
			this.removedCount++;
		}
		else{
			this.size++;
		}
	},

	since: function(index){
		index = parseInt(index);
		if( isNaN(index) ){
			throw new TypeError('history.since() expect a number');
		}
		index-= this.removedCount;
		return index < 0 ? [] : this.events.slice(index);
	},

	clear: function(){
		this.events.length = 0;
		this.size = 0;
		this.removedCount = 0;
	}
});

export default EventHistory;