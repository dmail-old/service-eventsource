import proto from 'proto';

// http://html5doctor.com/server-sent-events/
var SourceEvent = proto.extend({
	constructor: function(type, data){
		this.type = type;
		this.data = data ? String(data) : '';
		this.id = null;
	},

	toString: function(){
		var parts = [];

		if( this.retry ){
			parts.push('retry:' + this.retry);
		}

		if( this.id ){
			parts.push('id:' + this.id);
		}

		if( this.type !== 'message' ){
			parts.push('event:' + this.type);
		}

		if( this.data ){
			parts.push('data:' + this.data);
		}

		return parts.join('\n') + '\n\n';
	}
});

export default SourceEvent;
