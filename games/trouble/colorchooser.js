YUI.add("colorchooser", function(Y) {
	Y.ColorSquare = new Y.Base.create('colorsquare',Y.Model,[],
	{
		ATTRS:
		{
			color:{ value:0 },
			x: { value:0 },
			y: { value:0 },
			width: { value: 0 },
			height: { value: 0 }
		}
	});

	Y.ColorSquareView = Y.Base.create('colorsquareview',Y.View,[],
	{
		initializer: function()
		{
			var m = this.get('model');
			var c = this.get('container');

			var n = Y.Node.create('<div style="position:absolute; left:'+m.get('x')+'px; top:'+m.get('y')+'px; width:'+m.get('width')+'px; height:'+m.get('height')+'px;"></div>')
			var imgnode = Y.Node.create('<img style="margin-left:11px; margin-top:5px; width:'+m.get('width')+'px; height:'+m.get('height')+'px;" src="./images/p_'+m.get('color')+'.png"/>');
			n.append(imgnode);
			/*imgnode.on('click',function(e)
			{
				//Y.log(m.get('color'));
			});*/

			c.append(n);

		},
		render: function()
		{
			return this;
		}
	});

	Y.ColorChooserView = Y.Base.create('colorchooserview',Y.View,[],
	{
		current_player:'',
		initializer: function()
		{
			var m = this.get('model');
			var c = this.get('container');
			var n = Y.Node.create('<div style="width:100px; height:100px; background-color:#000000; border:solid 2px #888888;"></div>');
			n.setStyle('backgroundColor','#000000')
			var w=32;
			var h=40;
			var b0 = new Y.ColorSquare({x:0,y:0,width:w,height:h,color:'blue'});
			var b1 = new Y.ColorSquare({x:50,y:0,width:w,height:h,color:'yellow'});
			var b2 = new Y.ColorSquare({x:0,y:50,width:w,height:h,color:'green'});
			var b3 = new Y.ColorSquare({x:50,y:50,width:w,height:h,color:'red'});

			var b0v = new Y.ColorSquareView({model:b0});
			var b1v = new Y.ColorSquareView({model:b1});
			var b2v = new Y.ColorSquareView({model:b2});
			var b3v = new Y.ColorSquareView({model:b3});

			n.append(b0v.get('container'));
			n.append(b1v.get('container'));
			n.append(b2v.get('container'));
			n.append(b3v.get('container'));
			c.append(n);

			var par = this
			b0v.get('container').one('img').on('mousedown',function(e)
			{
				Y.one('#color_'+par.current_player).setAttribute('src','./images/p_'+b0v.get('model').get('color')+'.png');

				var tot = {}
				tot['player'] = par.current_player
				tot['color'] = colororder_inv[b0v.get('model').get('color')]
				game.socket.send('c.udc.'+JSON.stringify(tot))  // update player color

				colorchooser.get('container').setStyle('display','none');
				playerlist_clickblock=false;

			});
			b1v.get('container').one('img').on('mousedown',function(e)
			{
				Y.one('#color_'+par.current_player).setAttribute('src','./images/p_'+b1v.get('model').get('color')+'.png');

				var tot = {}
				tot['player'] = par.current_player
				tot['color'] = colororder_inv[b1v.get('model').get('color')]
				game.socket.send('c.udc.'+JSON.stringify(tot))  // update player color
				colorchooser.get('container').setStyle('display','none');
				playerlist_clickblock=false;

			});
			b2v.get('container').one('img').on('mousedown',function(e)
			{
				Y.one('#color_'+par.current_player).setAttribute('src','./images/p_'+b2v.get('model').get('color')+'.png');

				var tot = {}
				tot['player'] = par.current_player
				tot['color'] = colororder_inv[b2v.get('model').get('color')]
				game.socket.send('c.udc.'+JSON.stringify(tot))  // update player color
				colorchooser.get('container').setStyle('display','none');
				playerlist_clickblock=false;

			});
			b3v.get('container').one('img').on('mousedown',function(e)
			{
				Y.one('#color_'+par.current_player).setAttribute('src','./images/p_'+b3v.get('model').get('color')+'.png');

				var tot = {}
				tot['player'] = par.current_player
				tot['color'] = colororder_inv[b3v.get('model').get('color')]
				game.socket.send('c.udc.'+JSON.stringify(tot))  // update player color
				colorchooser.get('container').setStyle('display','none');
				playerlist_clickblock=false;

			});
			this.render()
		},
		render: function()
		{
			return this;
		}
	});
}, '1.0', {requires: ['json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});