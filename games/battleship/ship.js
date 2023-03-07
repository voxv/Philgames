YUI.add("ship", function(Y) {

	var parrframe = parent
	var parrapp = parrframe.app.get('activeView')

	Y.Ship = new Y.Base.create('ship',Y.Model,[],
	{
		ATTRS:
		{
			image: { value:0 },
			x: { value:0 },
			y: { value:0 },
			width: {value:0},
			height: {value:0},
			numSquares : { value:0 },
			scale:{ value:0 },
		}
	});
	Y.ShipView = Y.Base.create('shipview',Y.View,[],
	{
		imgnode:null,
		isvertical:false,
		selected:false,
		targetSquares:[],
		initializer: function()
		{

			this.targetSquares = [];
			this.isvertical = false;
			this.selected = false;
			this.imgnode = null;
			this.get('container').setStyle('cursor','pointer');
			var m = this.get('model');
			var c = this.get('container');
			var imgnode = this.imgnode = Y.Node.create("<img id='ship1' width="+m.get('width')+" height="+m.get('height')+" style='-moz-border-radius: 30px; border-radius: 30px; z-index:40; position:absolute; left:"+m.get('x')+"px; top:"+m.get('y')+"px;' src='"+m.get('image')+"'>");
			c.append(imgnode);

			var thisship = this

			dd = new Y.DD.Drag({
					node: imgnode
				}).plug(Y.Plugin.DDConstrained, {
        			constrain2node: '#grid_hotspot'
    		});

			imgnode.on('click',function (evt)
			{
				var ships = thisapp.get('activeView').ships;
				if (lockrotate || startbuttonclicked)
				{
					lockrotate = false
					//evt.event.cancelBubble = true;
					return;
				}

				var conflicts = 0;
				var totships = 0;
				Y.Array.each(ships,function(e){

					if (e.get('container').one('img').get('src')==imgnode.get('src'))
					{
						e.toggleVertical();

						thisship.selected = false;

						var ddd = imgnode;
						var grid = thisapp.get('activeView').gridview;
						var ships = thisapp.get('activeView').ships;

						var newx = ddd.getXY()[0];
						var newy = ddd.getXY()[1];

						var dims = grid.snap(newx,newy);

						thisship.targetSquares = grid.getTargetSquares(dims[0],dims[1],imgnode.get('width'),imgnode.get('height'),thisship.get('model').get('numSquares'));

						if (dims[1]==null || dims[1]=='undefined') return ;

						ddd.setStyles({
							top: dims[1],
							left: dims[0]
						});

						parrapp.playAudio(GAME_NAME,'click');

						conflicts = 0;
						totships = 0;
						Y.Array.each(ships, function(s)
						{
							if (s.targetSquares.length >0)
								totships++;

							Y.Array.each(ships, function(ss)
							{
								if (ss==s)  {  return; }
								if (s.targetSquares.length >0)
								{
									for (var i = 0 ; i < s.targetSquares.length ; i++)
									{
										if (inArray(s.targetSquares[i],ss.targetSquares))
										{
											ss.imgnode.setStyle('background','rgba(255,0,0,0.82)');
											s.imgnode.setStyle('background','rgba(255,0,0,0.82)');
											conflicts++;

										}
									}
								}
							});
						});

					}
				});

				if (conflicts==0 && totships==5)
				{
						Y.Array.each(ships, function(s)
						{
							s.imgnode.setStyle('background','rgba(0,0,0,0)');
						});

						thisapp.get('activeView').activateGoButton()
				}
				else if (conflicts==0)
				{
						Y.Array.each(ships, function(s)
						{
							s.imgnode.setStyle('background','rgba(0,0,0,0)');
						});
				}
				else
						thisapp.get('activeView').deactivateGoButton()
			});
			dd.on('drag:start', function(e) {

				if (startbuttonclicked)
				{
					e.event.cancelBubble = true;
					return;
				}
				lockrotate = true;

				if (Y.one('#chatinput'))
					Y.one('#chatinput').blur();

				var ships = thisapp.get('activeView').ships;
				Y.Array.each(ships, function(s)
				{
					s.imgnode.setStyle('background','rgba(0,0,0,0)');
				});
				thisship.selected = true;
				thisship.targetSquares = [];
				//rotate_audio.play();
				//thisship.imgnode.setStyle('background','rgba(0,0,0,0)');
			});

			dd.on('drag:drag',function(e)
			{
					if (startbuttonclicked)
					{
						e.event.cancelBubble = true;
						return;
					}
					lockrotate = true;
			 });
			 dd.on('drag:end', function(e) {

					if (startbuttonclicked)
					{
						e.event.cancelBubble = true;
						return;
					}

					thisship.selected = false;

			 		var ddd = this.get('node');
			 		var grid = thisapp.get('activeView').gridview;
			 		var ships = thisapp.get('activeView').ships;

			 		var newx = ddd.getXY()[0];
			 		var newy = ddd.getXY()[1];
					var dims = grid.snap(newx,newy);
					thisship.targetSquares = grid.getTargetSquares(dims[0],dims[1],imgnode.get('width'),imgnode.get('height'),thisship.get('model').get('numSquares'));

					if (dims[1]==null || dims[1]=='undefined') return ;
			        ddd.setStyles({
			            top: dims[1],
			            left: dims[0]
			        });

					parrapp.playAudio(GAME_NAME,'click');

					var conflicts = 0;
					var totships = 0;
					Y.Array.each(ships, function(s)
			        {
			        	if (s.targetSquares.length >0)
			        		totships++;
						Y.Array.each(ships, function(ss)
			        	{
			        		if (ss==s) return;
							if (s.targetSquares.length >0)
							{
								for (var i = 0 ; i < s.targetSquares.length ; i++)
								{
									if (inArray(s.targetSquares[i],ss.targetSquares))
									{
										ss.imgnode.setStyle('background','rgba(255,0,0,0.82)');
										s.imgnode.setStyle('background','rgba(255,0,0,0.82)');
										conflicts++;
									}
								}
							}
						});
			        });

					if (conflicts==0 && totships==5)
						thisapp.get('activeView').activateGoButton()
					else
						thisapp.get('activeView').deactivateGoButton()
					lockrotate = true;
    		});
		},
		toggleVertical: function()
		{
			if (!this.isvertical)
			{
				this.isvertical = true;
				var m = this.get('model');
				var sp = m.get('image').split('.png').join('_v.png');
				this.imgnode.set('width',m.get('height'));
				this.imgnode.set('height',m.get('width'));
				this.imgnode.set('src',sp);

				clean = this.imgnode.getStyle('top').split('px')[0];
				checkbound = parseInt(clean)+this.imgnode.get('height');
				if (checkbound > 641)
				{
					var nq = m.get('numSquares');
					this.imgnode.setStyle('top',(clean-(nq*40)))
				}
			}
			else
			{
				this.isvertical = false;
				var m = this.get('model');
				this.imgnode.set('width',m.get('width'));
				this.imgnode.set('height',m.get('height'));
				this.imgnode.set('src',m.get('image'));

				clean = this.imgnode.getStyle('left').split('px')[0];
				checkbound = parseInt(clean)+this.imgnode.get('width');
				if (checkbound > 990)
				{
					var nq = m.get('numSquares');
					this.imgnode.setStyle('left',(clean-(nq*40)))
				}
			}
			parrapp.playAudio(GAME_NAME,'pop');
		},
		render: function()
		{
			return this;
		}
	});

	Y.StaticShip = new Y.Base.create('staticship',Y.Model,[],
	{
		ATTRS:
		{
			image: { value:0 },
			x: { value:0 },
			y: { value:0 },
			width: {value:0},
			height: {value:0},
			numSquares : { value:0 },
			scale:{ value:0 },
			isvertical:{value : 0 }
		}
	});

	Y.StaticShipView = Y.Base.create('staticshipview',Y.View,[],
	{
		imgnode:null,
		isvertical:false,
		targetSquares:[],
		initializer: function()
		{
			var m = this.get('model');
			var c = this.get('container');

			img = m.get('image');
			w = m.get('width');
			h = m.get('height');
			if (m.get('isvertical')==1)
			{
				w = m.get('height');
				h = m.get('width');
				img = m.get('image').split('.png').join('_v.png');
			}
			var imgnode = this.imgnode = Y.Node.create("<img id='ship1' width="+w+" height="+h+" style='-moz-border-radius: 30px; border-radius: 30px; z-index:30; position:absolute; left:"+m.get('x')+"px; top:"+m.get('y')+"px;' src='"+img+"'>");
			c.append(imgnode);

		},
		render: function()
		{
			return this
		}
	});
}, '1.0', {requires: ['gallery-audio','json-parse','json-stringify','console','app','node','model','view', 'io']});
