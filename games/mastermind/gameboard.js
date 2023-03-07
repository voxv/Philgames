YUI.add("gameboard", function(Y) {
	var dropped = false;

	Y.GameBoard = new Y.Base.create('gameboard',Y.Model,[],
	{
		ATTRS:
		{
			x: { value:0 },
			y: { value:0 },
			width: { value: 0 },
			dicewidth : { value: 0 }
		}
	});



	Y.GameBoardView = Y.Base.create('gameboardview',Y.View,[],
	{
		dices:[],
		cupHome:[10,10],
		par:null,
		cupview:null,
		ddcup:null,
		currentResult:{},
		initializer: function()
		{
			var m = this.get('model');
			var c = this.get('container');
			c.setStyle('backgroundColor','#4563ff')
			c.setStyle('backgroundImage','url("images/back_game.jpg")')
			c.setStyles({position:'absolute',left:m.get('x'),top:m.get('y'),width:m.get('width')+'px',height:m.get('width')+'px'})


			this.createDices()

			this.cupHome[0] = m.get('x')+m.get('width')-170
			this.cupHome[1] = m.get('y')+m.get('width')-102
			var cup = new Y.Cup({x:this.cupHome[0],y:this.cupHome[1],width:100,height:152,dicesIn:[]})
			this.cupview = new Y.CupView({model:cup})
			this.get('container').append(this.cupview.get('container'))

			this.render()
		},
		setParent:function(par)
		{
			this.par=par
			this.setListeners()

		},
		setListeners:function()
		{

			var par = this
			this.get('container').on('click',function(e)
			{
				var sc = par.par.scorecard
				if (myturn && sc.subturn==1)
				{
					par.putDicesInCup([1,2,3,4,5])
					dispatcher.sendEvent(1,[1,2,3,4,5])
					//sc.subturn++;
				}
			});

			var mydata = { }
			//CUP
			this.ddcup = new Y.DD.Drag({
					node: this.cupview.get('container'),
					dragMode: 'intersect',
					data:mydata
				}).plug(Y.Plugin.DDConstrained, {
        		constrain2node: '#wrapper'
    		});
    		par = this
    		var sc = this.par.scorecard
    		this.ddcup.on('drag:mouseDown',function(e)
    		{

				if (!myturn || subturnbusted || par.cupview.isEmpty())
				{
					e.preventDefault();
					return;
				}
    		});
			this.ddcup.on('drag:drag', function(e)
			{
				//shake_audio.loop
				shake_audio.play()


			});

   		   this.ddcup.on('drag:end', function(e) {

   		   		var drag = e.target
				var n = drag.get('node')

				par.throwDices([e.pageX,e.pageY],[])
				e.preventDefault();
			});

			Y.Array.each(this.dices, function(d)
			{
				var mydata = { id:d.get('model').get('id')}
				var ddd = new Y.DD.Drag({
					node: d.get('container'),
					dragMode: 'intersect',
					data:mydata
					})
				ddd.on('drag:mouseDown',function(e)
				{
					if (!myturn || subturnbusted || par.par.scorecard.subturn<=1)
					{
						e.preventDefault();
						return;
					}
					dropped = false;
					var n = e.target.get('node')
					n.one('img').setStyle('zIndex',200)
				});

				ddd.on('drag:end',function(e)
				{
					var n = e.target.get('node')

					n.one('img').setStyle('zIndex',20)
					e.preventDefault();
				});
				/*ddd.on('drag:drag',function(e)
				{
					if (par.containsPoint([e.pageX,e.pageY],{top:'100',right:'439',bottom:'650',left:'139'}))
						Y.log('in '+[e.pageX,e.pageY])
					else
						Y.log('out'+[e.pageX,e.pageY])
				});*/


			});

			var drop = new Y.DD.Drop({
				node: '#cuphotspot'
			});
			drop.on('drop:over',function(e)
			{
				if (dropped) return
				dropped=true
				var diceId = e.drag.get('data')['id']
				if (diceId=='undefined' || diceId==null) return
				//Y.log('DRAG:'+e.drag.get('data').toSource())
				e.drag.get('node').setStyle('display','none')

				par.cupview.addDice(diceId)

				dispatcher.sendEvent(1,[diceId])

				incup_audio.play()
			});

		},
		putDicesInCup:function(dices)
		{
			var par = this
			par.cupview.get('model').set('dicesIn',dices)

			Y.Array.each(this.dices,function(dv)
			{
				if (inArray(dv.get('model').get('id'),dices))
				{

					dv.get('container').setStyle('display','none')
				}

			});

		},
		addDiceInCup:function(dice)
		{
			var par = this
			var temp = par.cupview.get('model').get('dicesIn')
			if (inArray(dice,temp)) {  return }
			temp.push(dice)
			par.cupview.get('model').set('dicesIn',temp)

			Y.Array.each(this.dices,function(dv)
			{
				if (dv.get('model').get('id')==dice)
				{
					dv.get('container').setStyle('display','none')
				}

			});
			//Y.log('new dicesIn: '+par.cupview.get('model').get('dicesIn').toSource())
		},
		createDices:function()
		{
			var dicewidth = this.get('model').get('dicewidth')
			var d1 = new Y.Dice({x:100,y:100,width:dicewidth,id:1});
			var dv1 = new Y.DiceView({model:d1})
			this.dices.push(dv1)
			this.get('container').append(dv1.get('container'))


			var d2 = new Y.Dice({x:150,y:100,width:dicewidth,id:2});
			var dv2 = new Y.DiceView({model:d2})
			this.dices.push(dv2)
			this.get('container').append(dv2.get('container'))


			var d = new Y.Dice({x:200,y:100,width:dicewidth,id:3});
			var dv = new Y.DiceView({model:d})
			this.dices.push(dv)
			this.get('container').append(dv.get('container'))


			var d = new Y.Dice({x:250,y:100,width:dicewidth,id:4});
			var dv = new Y.DiceView({model:d})
			this.dices.push(dv)
			this.get('container').append(dv.get('container'))


			var d = new Y.Dice({x:300,y:100,width:dicewidth,id:5});
			var dv = new Y.DiceView({model:d})
			this.dices.push(dv)
			this.get('container').append(dv.get('container'))

		},
		throwDices:function(center,forcedFaces)
		{
			//forcedFaces=[4,4,4,4,4]
			this.setNewDicePositions(center)

			count = 0
			var par = this
			var tosend = {}
			Y.Array.each(this.dices,function(d)
			{
				if (par.isInCup(d.get('model').get('id')))
				{
					if (forcedFaces.length==0)
					{
						d.shuffle()
						d.throwDice(center)
						tosend[d.get('model').get('id')] = d.get('model').get('selectedFace')
					}
					else
					{
						var id = d.get('model').get('id')
						var ff = forcedFaces[id]
						d.get('model').set('selectedFace',ff)
						d.throwDice(center)
					}
				}
			});
			if (forcedFaces.length==0)
			{
				dispatcher.sendEvent(2,tosend)
				this.recalcResults()
			}
			this.cupview.get('model').set('dicesIn',[])
			if (forcedFaces.length==0)
			{

				if (this.par.scorecard.subturn>=3)
				{
					subturnbusted = true
				}
				this.par.scorecard.subturn++
			}

		},
		recalcResults:function()
		{
			tot = {}
			var id = 0;
			var total = 0
			for (var i = 0 ; i < 6 ; i++)
			{
				tot[i] = 0
				Y.Array.each(this.dices,function(d)
				{
					var sel = d.get('model').get('selectedFace')
					if (sel==(i+1))
						tot[i]+=sel
					if (i==0)
					total+=sel
				});
			}
			tot[6] =0
			tot[7] =0
			tot[8] =0  // low
			if (total>=21) tot[8] = total

			tot[9] =0  // hi
			if (total>=22) tot[9] = total

			tot[10] = 0 // small straight
			var tofind = [1,2,3,4,5]
			var found = []
			Y.Array.each(this.dices,function(d)
			{
				var f = d.get('model').get('selectedFace')
				if (inArray(f,tofind) && !inArray(f,found))
					found.push(f)
			});
			if (found.length==tofind.length)
			{
				tot[10] = 25
			}

			tot[11] = 0  // big straight
			var tofind = [2,3,4,5,6]
			var found = []
			Y.Array.each(this.dices,function(d)
			{
				var f = d.get('model').get('selectedFace')
				if (inArray(f,tofind) && !inArray(f,found))
					found.push(f)
			});
			if (found.length==tofind.length)
			{
				tot[11] = 25
			}

			tot[12]=0  // full


			var dict  = {}
			Y.Array.each(this.dices,function(d)
			{
				var f = d.get('model').get('selectedFace')
				if (!dict[f]) dict[f]=0
				dict[f]++
			});
			var fh=false;
			for (var i in dict)
			{
				if (dict[i]>=3)
				{
					for (var j in dict)
					{
						if (i==j) continue
						if (dict[j]>=2)
						{
							fh=true
							break
						}
					}
				}

			}
			if (fh) tot[12]=25

			tot[13] = 0

			for (var i in dict)
			{
				if (dict[i]==5)
				{
					tot[13]=30

					break;
				}
			}
			this.currentResult = tot


			this.par.scorecard.updateCurrentPreview(tot)

		},
		isInCup:function(id)
		{
			var c = this.cupview
			var m = c.get('model')
			if (inArray(id,m.get('dicesIn')))
				return true
			return false

		},
		setNewDicePositions:function(center)
		{
			var par = this
			Y.Array.each(this.dices,function(d)
			{
				if (par.isInCup(d.get('model').get('id')))
				{


					var m = d.get('model')
					var w = par.get('model').get('width')
					var boardx = par.get('model').get('x')
					var boardy = par.get('model').get('y')
					var posx = Math.floor(Math.random()*w)
					var posy = Math.floor(Math.random()*w)
					var found = true
					var tries=0
					var maxtries = 10000
					while (found && tries++<maxtries)
					{
						var found = false
						Y.Array.each(par.dices,function(dd)
						{
							var mm = dd.get('model')
							var c1
							if (center[0]<par.get('model').get('width')/2)
							{
								c1 = posx<center[0]+30
							}
							else
							{
								c1 = posx>center[0]-30
							}
							var c2
							if (center[1]<par.get('model').get('width')/2)
							{
								c2 = posy<center[1]+30
							}
							else
							{
								c2 = posy>center[1]-30
							}
							if (mm.get('id')!= m.get('id') )
							{
								if (par.containsDice([posx,posy],dd) || posx<boardx+10 || posx>boardx+w-10 || posy<boardy+10 || posy>boardy+w-10 || c1  || c2)
									found=true
							}
						});

						if (tries>=maxtries)
						{
							//Y.log('maxtries busted')
						}
						if (found)
						{
							posx = Math.floor(Math.random()*w)
							posy = Math.floor(Math.random()*w)
						}
					}


					d.get('model').set('x',posx)
					d.get('model').set('y',posy)
				}
			});
		},
		containsDice:function(pp,d2)
		{
			var m2 = d2.get('model')
			var w = m2.get('width')
			var pos1x = pp[0]
			var pos1y = pp[1]
			var pos2x = m2.get('x')
			var pos2y = m2.get('y')

			return (pos1x <= pos2x+w &&
					  pos2x <= pos1x+w &&
					  pos1y <= pos2y+w &&
					  pos2y <= pos1y+w)
		},
		containsPoint:function(pp,region)
		{
			var pos1x = pp[0]
			var pos1y = pp[1]
			var pos2x = region['left']
			var pos2y = region['top']
			var w = region['right']-region['left']
			var h = region['bottom']-region['top']

			return (pos1x >= pos2x && pos1x<pos2x+w && pos1y >= pos2y && pos1y<pos2y+h)
		},
		showDices:function()
		{
			Y.Array.each(this.dices,function(d)
			{
				d.get('container').setStyle('display','block');
			});
		},
		render: function()
		{
			var m = this.get('model')
			var c = this.get('container');


			return this;
		}
	});
	function inArray(needle, haystack) {
		var length = haystack.length;
		for(var i = 0; i < length; i++) {
			if(haystack[i] == needle) return true;
		}
		return false;
	}

	Y.Cup = new Y.Base.create('cup',Y.Model,[],
	{
		ATTRS:
		{
			x: { value:0 },
			y: { value:0 },
			width: { value: 0 },
			height: { value: 0 },
			dicesIn: { value: [] }
		}
	});



	Y.CupView = Y.Base.create('cupview',Y.View,[],
	{
		initializer: function()
		{
			var m = this.get('model');
			var c = this.get('container');
			this.imgnode = Y.Node.create('<img width='+m.get('width')+' height='+m.get('height')+' style="z-index:30; position:absolute; " src="images/cup.png">')
			c.setStyles({ position:'absolute',left:m.get('x'),top:m.get('y')})
			c.append(this.imgnode)

		},
		isEmpty:function()
		{
			return this.get('model').get('dicesIn').length==0
		},
		addDice:function(id)
		{
			var old = this.get('model').get('dicesIn')
			old.push(id)
			this.get('model').set('dicesIn',old)
		},
		render:function()
		{

			return this
		}
	});
}, '1.0', {requires: ['json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});