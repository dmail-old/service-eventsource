import SourceEvent from '../lib/source-event.js';

export function suite(add){
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

	events.forEach(function(event, index){
		add('sourceEvent toString() #' + index, function(test){
			var sourceEvent = SourceEvent.create();
			Object.assign(sourceEvent, event.properties);

			test.equal(sourceEvent.toString(), event.string);
		});		
	});
}