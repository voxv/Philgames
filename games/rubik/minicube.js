YUI.add("minicube", function(Y) {

	var parr = parent
	Y.Cube = new Y.Base.create('cube',Y.Model,[],
	{
		ATTRS:
		{
			x: { value:0 },
			y: { value:0 },
			width: { value:30 },
			colors: { value:[] },
			selectedColor: {value:'blue'},
			id: { value:0 },
		}
	});

	Y.CubeView = Y.Base.create('cubeview',Y.View,[],
	{
		initializer:function()
		{
			var cols = this.get('model').get('colors')
			var r = Math.floor((Math.random() * cols.length));
			this.get('model').set('selectedColor',cols[r])
			this.get('container').append(Y.Node.create('<img style="position:absolute; left:'+this.get('model').get('x')+'; top:'+this.get('model').get('y')+';" src="./images/'+this.get('model').get('selectedColor')+'_small.png" width='+this.get('model').get('width')+' height='+this.get('model').get('width')+'/>'));
		},
		render:function()
		{
			this.get('container').one('img').set('src','./images/'+this.get('model').get('selectedColor')+'_small.png')
			return this
		}
	});

	Y.MiniCubeGrid = new Y.Base.create('minicubegrid',Y.Model,[],
	{
		ATTRS:
		{
			x: { value:0 },
			y: { value:0 },
			width: { value:30 },
			minicubes: { value:[] },
		}
	});

	Y.MiniCubeGridView = Y.Base.create('minicubegridview',Y.View,[],
	{
		cubeviewlist:[],
		initializer:function()
		{
			cubelist = new Y.ModelList();

			cols = []
			cols[0] = ['blue','yellow','green','green','blue','green']
			cols[1] = ['blue','yellow','blue','yellow','blue','yellow']
			cols[2] = ['blue','yellow','blue','red','yellow','red']
			cols[3] = ['white','red','red','white','red','white']
			cols[4] = ['orange','white','green','white','green','orange']
			cols[5] = ['white','orange','red','white','orange','red']
			cols[6] = ['blue','yellow','green','blue','blue','yellow']
			cols[7] = ['orange','white','orange','white','white','orange']
			cols[8] = ['red','orange','green','green','orange','red']

			colsR = []
			var taken = []

			while (colsR.length != cols.length)
			{
				var r = Math.floor((Math.random() * cols.length));
				if (!inArray(r,taken))
				{
					colsR.push(cols[r])
					taken.push(r)
				}
			}
			cols = colsR
			cubelist.after('add',this.addCubeToList,this);
			var count = 0;
			var tosend = {}
			for (var i = 0 ; i < 3 ; i++)
			{
				for (var j = 0 ; j < 3 ; j++)
				{
					cc = cols[count]
					cx = this.get('model').get('x')+this.get('model').get('width')*j
					cy = this.get('model').get('y')+this.get('model').get('width')*i
					var cube = new Y.Cube({id:count,x:cx,y:cy,width:this.get('model').get('width'),colors:cc,selectedColor:'blue'})
					cubelist.add(cube);
					tosend[count] = cube.get('selectedColor')[0]
					count++
				}
			}
			if (game.players.self.host)
			{
				game.socket.send('c.ssm.'+Y.JSON.stringify(tosend))

			}
		},
		addCubeToList: function(e)
		{

			list = e.currentTarget;
			list_size = list.size()-1;
			var newv = new Y.CubeView({model:list.item(list_size)});
			miniById[list.item(list_size).get('id')] = newv
			this.cubeviewlist.push(newv);

			newv.render();

			this.get('container').append(newv.get('container'));

		},
		setCols:function(cols)
		{
			cv = this.cubeviewlist

			for (var i in cols)
			{
				if (cols.hasOwnProperty(i))
				{

					cv[i].get('model').set('selectedColor',colind[cols[i]])
					cv[i].render()
				}
			}
		},
		gridsMatch:function(grid)
		{
			//Y.log('GRID:'+grid.toSource())
			cv = this.cubeviewlist

			found = true
			var count = 0
			for (var i in grid)
			{
				if (grid.hasOwnProperty(i))
				{
					if (grid[i]!=miniById[i].get('model').get('selectedColor'))
					{
						found = false
						if (count==6 && !dangeralreadyplayed)
						{
							dangeralreadyplayed=true;
							game.socket.send('c.sd.');
						}
						break
					}
					count++;
				}
			}
			return found
		},
		render:function()
		{
			return this
		}
	});

	function inArray(needle, haystack) {
		var length = haystack.length;
		for(var i = 0; i < length; i++) {
			if(haystack[i] == needle) return true;
		}
		return false;
	}
}, '1.0', {requires: ['gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});
