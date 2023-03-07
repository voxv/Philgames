YUI.add("gameboard", function(Y) {


	var parrframe = parent;
	var parrapp = parent.app.get('activeView');

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
			c.setStyle('backgroundImage','url("images/bg1.jpg")')
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
			this.get('container').on('mousedown',function(e)
			{
				if (firstPutInCupDone)
				{
					e.preventDefault()
					return
				}
				par.get('container').onmousedown = null
				firstPutInCupDone = true;
				var sc = par.par.scorecard
				if (myturn && sc.subturn==1)
				{
					par.putDicesInCup([1,2,3,4,5])
					game.socket.send('c.pdc.[1,2,3,4,5]');

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
				/*console.log('myturn:'+myturn)
				console.log('subturnbusted:'+subturnbusted)
				console.log('par.cupview.isEmpty():'+par.cupview.isEmpty())
				console.log('my_is_in_anim:'+my_is_in_anim)*/
				if (!myturn || subturnbusted || par.cupview.isEmpty() || my_is_in_anim)
				{
					e.preventDefault();
					return;
				}
				game.socket.send('c.ssh.')   // start shake
    		});
			this.ddcup.on('drag:drag', function(e)
			{
				if (shake_audio_block) return;
				shake_audio_block = true
				parrapp.playAudio(GAME_NAME,'shake1', function(e){  shake_audio_block = false;  })
			});

   		   this.ddcup.on('drag:end', function(e) {

   		   		var drag = e.target
				var n = drag.get('node')

				otherhasthrown=false;
				game.socket.send('c.esh.')  // stop shake
				par.throwDices([e.pageX,e.pageY],[])
				e.preventDefault();
			});

			Y.Array.each(this.dices, function(d)
			{
				//d.get('container').detachAll('drag:mouseDown')
				//d.get('container').detachAll('drag:end')


				var mydata = { id:d.get('model').get('id')}
				d.ddd = new Y.DD.Drag({
					node: d.get('container'),
					dragMode: 'intersect',
					data:mydata
					})

				d.ddd.on('drag:mouseDown',function(e)
				{
					if (!myturn || subturnbusted || par.par.scorecard.subturn<=1 || my_is_in_anim || !otherhasthrown)
					{
						e.preventDefault();
						return;
					}
					dropped = false;
					var n = e.target.get('node')
					n.one('img').setStyle('zIndex',200)
				});

				d.ddd.on('drag:end',function(e)
				{
					var n = e.target.get('node')

					n.one('img').setStyle('zIndex',20)
					e.preventDefault();
				});

				//ddd.set('node',d.get('container'))
				//console.log(ddd.get('node'))
			});

			dddrop = new Y.DD.Drop({
				node: '#cuphotspot'
			});
			dddrop.on('drop:over',function(e)
			{
				if (dropped) return
				dropped=true
				var diceId = e.drag.get('data')['id']
				if (diceId=='undefined' || diceId==null) return

				e.drag.get('node').setStyle('display','none')
				//console.log('ADD DCIE '+diceId)
				par.cupview.addDice(diceId)
				//console.log('cup1:'+par.cupview.isEmpty())
				///TODO
				//dispatcher.sendEvent(1,[diceId])
				var ds = [diceId]
				game.socket.send('c.pdc.'+JSON.stringify(ds));

				parrapp.playAudio(GAME_NAME,'incup')
			});

		},
		putDicesInCup:function(dices,anim)
		{
			var par = this
			par.cupview.get('model').set('dicesIn',dices)

			if (!anim)   // it's me playing
			{
				Y.Array.each(this.dices,function(dv)
				{
					if (inArray(dv.get('model').get('id'),dices))
					{
						var node = dv.get('container')
						var danim = new Y.Anim({
								node: node,
								from: { xy:[dv.get('model').get('x'),dv.get('model').get('y')] },
								to: { xy:[par.cupHome[0],par.cupHome[1]] },
								duration : dice_anim_speed
							});
						danim.on('end',function(e)
						{
							dv.get('container').setStyle('display','none')
							if (dv.get('model').get('id')==3)
								parrapp.playAudio(GAME_NAME,'incup')
							if (dv.get('model').get('id')==5)
							{
								firstPutInCupDone = false;
								my_is_in_anim = false;
							}
						});
						my_is_in_anim = true;
						danim.run()
					}

				});

			}
			else
			{

				Y.Array.each(this.dices,function(dv)
				{
					if (inArray(dv.get('model').get('id'),dices))
					{
						var node = dv.get('container')
						var oldx = dv.get('model').get('x')
						var oldy = dv.get('model').get('y')
						var danim = new Y.Anim({
								node: node,
								from: { xy:[dv.get('model').get('x'),dv.get('model').get('y')] },
								to: { xy:[par.cupHome[0],par.cupHome[1]] },
								duration : dice_anim_speed
							});
						danim.on('end',function(e)
						{

							var tt = has_dice_throw_after_anim

							/*if (has_dice_throw_after_anim && dv.get('model').get('id')==5)
							{
								Y.log('after 5 throw')
								par.throwDices([370,370],dice_throw_after_anim)
								//alert(1)
								game.socket.send('c.tb.')
								dice_throw_after_anim = {}
								is_in_anim_dice = false;

								has_dice_throw_after_anim = false;

								//node.setStyle('display','none')
								//node.setXY([oldx,oldy])
							}*/
							//else if (dv.get('model').get('id')==5)
							if (dv.get('model').get('id')==5)
							{

								is_in_anim_dice = false;
							}
							if (!tt)
							{
								//is_in_anim_dice = false;
								dv.get('container').setStyle('display','none')
								if (dv.get('model').get('id')==3)
									parrapp.playAudio(GAME_NAME,'incup')
							}

							//dv.get('container').setStyle('display','none')
							//is_in_anim_dice = false;
						});
						is_in_anim_dice=true
						danim.run()
					}

				});



			}

		},
		addDiceInCup:function(dice)
		{
			var par = this
			is_in_anim_dice=true
			//console.log(par.cupview.get('model').get('dicesIn').toSource())
			var temp = par.cupview.get('model').get('dicesIn')
			if (inArray(dice,temp)) {  return }
			temp.push(dice)
			par.cupview.get('model').set('dicesIn',temp)

			//console.log('addDiceInCup:'+par.cupview.get('model').get('dicesIn').toSource())
			Y.Array.each(this.dices,function(dv)
			{
				if (dv.get('model').get('id')==dice)
				{

					var node = dv.get('container')
					var oldx = dv.get('model').get('x')
					var oldy = dv.get('model').get('y')
					var danim = new Y.Anim({
							node: node,
							from: { xy:[dv.get('model').get('x'),dv.get('model').get('y')] },
							to: { xy:[par.cupHome[0],par.cupHome[1]] },
							duration : dice_anim_speed
						});
					danim.on('end',function(e)
					{
						parrapp.playAudio(GAME_NAME,'incup')


						/*var tt = has_dice_throw_after_anim

						if (has_dice_throw_after_anim && dv.get('model').get('id')==last_dice_anim)
						{
							par.throwDices([370,370],dice_throw_after_anim)
							dice_throw_after_anim = {}
							is_in_anim_dice = false;
							has_dice_throw_after_anim = false;

						}
						else if (has_dice_throw_after_anim)
							dv.get('container').setStyle('display','none')
						if (!tt)
						{
							is_in_anim_dice = false;
							dv.get('container').setStyle('display','none')
						}*/
						/*if (animsqueue.isEmpty())
						{
							par.throwDices([370,370],toThrow)
							toThrow = {}
						}*/
						is_in_anim_dice = false;
						dv.get('container').setStyle('display','none')
					});

					danim.run()
					//last_dice_anim = dv.get('model').get('id')
				}

			});
		},
		createDices:function()
		{
			//if (parrframe.main_instance.reconnected) return
			//Y.log('create dice '+this.dices.length)
			this.dices = []
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
			//Y.log('create dice end: '+this.dices.length)

		},
		throwDices:function(center,forcedFaces)
		{
			otherhasthrown = false;
			//Y.log('THROW '+forcedFaces.toSource())
			//forcedFaces=[4,4,4,4,4]
			this.setNewDicePositions(center)

			this.flipCup();
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
						//Y.log('throwDice:'+d.get('model').get('id'))
						d.throwDice(center)
					}
				}

			});
			if (forcedFaces.length==0)
			{
				///TODO
				//dispatcher.sendEvent(2,tosend)
				game.socket.send('c.td.'+JSON.stringify(tosend));
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
		flipCup:function()
		{
			var par = this
			var cpv = this.cupview.get('container')
			var cux = this.cupview.get('model').get('x')
			var cuy = this.cupview.get('model').get('y')

			var rrt = new Y.RotAnimGame({deg:0});
			rrt.after('degChange',function(){ cpv.one('img').setStyle('transform','rotateZ('+rrt.get('deg')+'deg)'); /* shake_anim.get('node').render() */ })
			var movea = new Y.Anim({
				node: cpv.one('img'),
				from: { xy: [cux,cuy] },
				to: { xy: [(parseInt(this.cupHome[0])+20),(parseInt(this.cupHome[1])-150)] },
				duration : 0.1
			});
			movea.on('end',function(e){
				movea.set('reverse',true);
				movea.detach('end')
				movea.run();
			})
			movea.run();

			var rota = new Y.Anim({
				node: rrt,
				from: { deg:0 },
				to: { deg:-108 },
				duration : 0.09
			});
			rota.on('end',function(e){
				rota.set('reverse',true);
				rota.detach('end')
				rota.set('duration',0.3)
				rota.run();
			})
			rota.run();

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
			//Y.log(tot.toSource())

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
			this.imgnode = Y.Node.create('<img width='+m.get('width')+' height='+m.get('height')+' style="z-index:30; position:absolute; " src="./images/cup.png">')
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
			var m = this.get('model');
			this.get('container').setStyles({ position:'absolute',left:m.get('x'),top:m.get('y')})
			return this
		}
	});
}, '1.0', {requires: ['json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});