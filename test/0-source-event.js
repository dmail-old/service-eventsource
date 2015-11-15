import SourceEvent from '../lib/source-event.js';

export function suite(add){

	add('sourceEvent toString()', function(){
		var events = [
			{
				properties: {type: 'message', data: 'data'},
				string: 'data:data\n\n'
			},
			{
				properties: {type: 'message', data: 'data', id: 10},
				string: 'id:10\ndata:data\n\n'
			},
			{
				properties: {type: 'foo'},
				string: 'event:foo\n\n'
			},
			{
				properties: {type: 'bar', retry: 10, id: 'id', data: 'boo'},
				string: 'retry:10\nid:id\nevent:bar\ndata:boo\n\n'
			}
		];

		events.forEach(function(event){
			var sourceEvent = SourceEvent.create();
			Object.assign(sourceEvent, event.properties);

			this.equal(sourceEvent.toString(), event.string);
		}, this);		
	});

}