YUI.add("grids", function(Y) {

	var parr = parent;

	Y.GridSquare = new Y.Base.create('gridsquare',Y.Model,[],
	{
		ATTRS:
		{
			x:{ value:0 },
			y: { value:0 },
			width: { value:0 },
			id:{value:0},
			type: { value:'background' },
			color: { value:0 },
			z : { value:0 }
		}
	});
	Y.GridSquareView = Y.Base.create('gridsquareview',Y.View,[],
	{
		graph:null,
		lastY:50,
		dirY:'top',
		mouseisdown:0,
		isopponent:false,
		initializer: function()
		{
			var c = this.get('container');
			var m = this.get('model');

			var posx =  m.get('x');
			var posy =  m.get('y');

			var node = null;
			if (m.get('type')=='background')
			{
				node = Y.Node.create('<div style=" position:absolute; top:'+posy+'px; left:'+posx+'px; width:'+m.get('width')+'px; height:'+m.get('width')+'px;"><img id="spaceimg" style="position:absolute; top:0px; left:0px; width:'+m.get('width')+'; height:'+m.get('width')+'; z-index:'+m.get('z')+';" src="./images/single.png"></div>');
			}
			else
			{
				var col = m.get('color')
				var path = './images/lose.png';
				if (col!='trans')
					path = './images/'+col+'_small.png'

				node = Y.Node.create('<div style=" position:absolute; top:'+posy+'px; left:'+posx+'px; width:'+m.get('width')+'px; height:'+m.get('width')+'px;"><img style="position:absolute; top:0px; left:0px; width:'+m.get('width')+'; height:'+m.get('width')+'; z-index:'+m.get('z')+';" src="'+path+'"></div>');

				if (m.get('type')=='space' || m.get('type')=='spaceop') {  node.setStyle('display','none'); }
				if (m.get('type')=='space') spaceview = this;
			}
			c.append(node);

			if (m.get('type')!='background' && m.get('type')!='space' && m.get('type')!='blockop')
			{
				var parentview = this;
				c.on('mousedown',function(e) {
					if (blockallinputs || otherplayerwon) return;
					parentview.blockAction(e)
				});
				c.on('touchstart',function(e) {
					if (blockallinputs  || otherplayerwon) return;
					parentview.blockAction(e)
				});
			}
		},
		updateImage:function(color)
		{
			var path = './images/lose.png';
			if (color!='trans')
				path = './images/'+color+'_small.png'

			this.get('container').one('img').set('src',path)
		},
		blockAction:function(e)
		{
			if (is_in_anim || blocksToMove.length>0)
				return;

			is_in_anim=true;

			var model = this.get('model');
			var sm = spaceview.get('model');

			if (model.get('x')==sm.get('x'))
			{
				if (model.get('y')<sm.get('y'))
					this.move('bottom')
				else
					this.move('top')
			}
			else if (model.get('y')==sm.get('y'))
			{
				if (model.get('x')<sm.get('x'))
					this.move('right')
				else
					this.move('left')
			}
			else
				is_in_anim=false;
		},
		getBlocks:function(dir)
		{
			var ret = [];
			var pp = this.get('model');
			var mypos = [pp.get('x'),pp.get('y')]
			for (var i in blockById)
			{
				if (blockById.hasOwnProperty(i))
				{
					var b = blockById[i];
					var bm = b.get('model');
					var bx = bm.get('x');
					var by = bm.get('y');
					switch (dir)
					{
						case 'bottom':
							if (bx!=mypos[0] || by<=mypos[1]) continue;
							break;
						case 'top':
							if (bx!=mypos[0] || by>=mypos[1]) continue;
							break;
						case 'right':
							if (by!=mypos[1] || bx<=mypos[0]) continue;
							break;
						case 'left':
							if (by!=mypos[1] || bx>=mypos[0]) continue;
							break;
					}
					ret.push(i);
				}
			}
			return ret;
		},
		move:function(toPos)
		{
			var model = this.get('model');
			var oldy = model.get('y')
			var oldx = model.get('x')
			var spacemodel = spaceview.get('model');

			if (model.get('type')=='space') return;

			var pm = this.get('model');
			var mypos = [pm.get('x'),pm.get('y')];

			var tofollow = this.getBlocks(toPos);

			blocksToMove.push(model.get('id'))
			blocksToSend[model.get('id')]=toPos[0]

			touched = model.get('id')

			if (!parent.main_instance.low_res)
			{
				this.moveOne(toPos);

				for (var i = 0 ; i < tofollow.length ; i++)
				{
					var bv = blockById[tofollow[i]];
					var bm = bv.get('model');
					var bpos = [bm.get('x'),bm.get('y')]

					var spacemodel = spaceview.get('model');
					var spos = [spacemodel.get('x'),spacemodel.get('y')]

					if (bm.get('id')!=24)
					{
						if ((toPos=='bottom' && bpos[1]<spos[1]) ||
							(toPos=='top' && bpos[1]>spos[1]) ||
							(toPos=='right' && bpos[0]<spos[0]) ||
							(toPos=='left' && bpos[0]>spos[0]) )
						{
							blocksToMove.push(bm.get('id'))
							blocksToSend[bm.get('id')]=toPos[0]
							bv.moveOne(toPos)
						}
					}
				}
			}
			else
			{
				for (var i = 0 ; i < tofollow.length ; i++)
				{
					var bv = blockById[tofollow[i]];
					var bm = bv.get('model');
					var bpos = [bm.get('x'),bm.get('y')]

					var spacemodel = spaceview.get('model');
					var spos = [spacemodel.get('x'),spacemodel.get('y')]

					if (bm.get('id')!=24)
					{
						if ((toPos=='bottom' && bpos[1]<spos[1]) ||
							(toPos=='top' && bpos[1]>spos[1]) ||
							(toPos=='right' && bpos[0]<spos[0]) ||
							(toPos=='left' && bpos[0]>spos[0]) )
						{
							blocksToMove.push(bm.get('id'))
							blocksToSend[bm.get('id')]=toPos[0]

						}
					}
				}
				for (var i in blocksToSend)
				{
					if (blocksToSend.hasOwnProperty(i))
					{
						blockById[i].moveOne(toPos)
					}
				}
			}

			spacemodel.set('x',oldx)
			spacemodel.set('y',oldy)

			if (!stopclickaudio)
				parr.app.get('activeView').playAudio(GAME_NAME,'click');
		},
		moveOne: function(toPos)
		{
			var model = this.get('model');
			var spacemodel = spaceview.get('model');
			if (model.get('type')=='space') return;
			var pos = {
						'bottom':[0,model.get('width') ],
						'top'   :[0,-model.get('width')],
						'left'  :[-model.get('width'),0],
						'right':[model.get('width'),0 ]
			}

			var x = pos[toPos][0]
			var y = pos[toPos][1]

			var newx =this.get('container').getXY()[0]+x
			var newy = this.get('container').getXY()[1]+y

			model.set('x',model.get('x')+x)
			model.set('y',model.get('y')+y)

			if (!parent.main_instance.low_res)
				this.runAnim(this.get('container'),[newx, newy]);
			else
				this.runNoAnim(this.get('container'),[newx, newy]);
		},
		runNoAnim:function(node,pos)
		{
			node.setXY( [ pos[0],pos[1] ] );
			var modelid = this.get('model').get('id')

			if (!this.isopponent)
			{
				var index = blocksToMove.indexOf(modelid);
				blocksToMove.splice(index, 1);

				if (blocksToMove.length==0)
				{
					var tosend = { 'r':touched , 'b':blocksToSend }
					game.socket.send('c.bm.'+Y.JSON.stringify(tosend))  // send blocks to move on the other side
					is_in_anim=false;
					blocksToSend = {}
					touched = -1;
				}
			}
			else
			{
				var index = blocksToMoveOp.indexOf(modelid);
				blocksToMoveOp.splice(index, 1);
				if (blocksToMoveOp.length==0)
				{
					is_in_anim_op=false;
					if (blocksqueue.isEmpty() && otherplayerwon && !playlosestarted)
					{
						playlosestarted = true;
						//Y.log('playlose from grid')
						thisapp.get('activeView').playLoseGame();
					}
				}
			}
			this.postMove()
		},
		runAnim:function(node,pos)
		{
			var currentAnim = null;
			for (var i = 0 ; i < max_anims ; i++)
			{
				if (anims[i].free)
					currentAnim = anims[i];
			}

			currentAnim.free = false;
			currentAnim.set('node' , node)
			var pp = this;
			if (pp.isopponent)
				currentAnim.set('duration',animspeedop)
			currentAnim.detach()
			currentAnim.on('end',function(e){
				var thismodelid = pp.get('model').get('id')
				if (!pp.isopponent)
				{
					var index = blocksToMove.indexOf(thismodelid);
					blocksToMove.splice(index, 1);
					if (blocksToMove.length==0)
					{
						var tosend = { 'r':touched , 'b':blocksToSend }
						game.socket.send('c.bm.'+Y.JSON.stringify(tosend))  // send blocks to move on the other side
						is_in_anim=false;
						blocksToSend = {}
						touched = -1;
					}
					currentAnim.free = true;
				}
				else
				{
					var index = blocksToMoveOp.indexOf(thismodelid);
					blocksToMoveOp.splice(index, 1);
					if (blocksToMoveOp.length==0)
					{
						is_in_anim_op=false;
						if (blocksqueue.isEmpty() && otherplayerwon && !playlosestarted)
						{
							playlosestarted = true;
							//Y.log('playlose from grid')
							thisapp.get('activeView').playLoseGame();
						}
					}

					currentAnim.free = true;
					currentAnim.set('duration',animspeed)
				}
				pp.postMove()
			})
			currentAnim.set('to', { xy: [pos[0], pos[1]] });
			currentAnim.run();
		},
		postMove:function()
		{
			var gridsview = thisapp.get('activeView').grids1
			var center = gridsview.getCenterColors()

			var gridsviewmini = thisapp.get('activeView').minigrid
			if (gridsviewmini.gridsMatch(center))
			{
				if (endgamesent) return;
				endgamesent=true;
				game.socket.send('c.rw.');
			}
		},
		render: function()
		{
			return this;
		}
	});

	Y.Grid = new Y.Base.create('grid',Y.Model,[],
	{
		ATTRS:
		{
			squarewidth:{ value:0 },
			squarenum: { value:0 },
			x:{value:0},
			y:{value:0}
		}
	});
	Y.GridView = Y.Base.create('gridview',Y.View,[],
	{
		initializer: function()
		{
			var m = this.get('model');
			var c = this.get('container');

			this.cadres = Y.Node.create('<img style="z-index:-1" src="./images/cadres.png">')
			Y.one('#wrapper').append(this.cadres);

			this.cadres.setStyles({ display:'block',position:'fixed', left:'0px', top:'-60px', zIndex:'2', opacity:'1'} )

			var sw = m.get('squarewidth');
			var sn = m.get('squarenum');

			var count = 0;

			for (var i = 0*sw ; i < 5*sw ; i+=sw)
			{
				for (var j = 0*sw ; j < 5*sw ; j+=sw)
				{
					var cc = new Y.GridSquare({x:j+offsetx,y:i+offsety,width:sw,id:count,z:'110','type':'background','color':0})
					var newv = new Y.GridSquareView({model:cc});
					this.get('container').append(newv.get('container'));
					count++;
				}
			}

			var colors = this.getRandomColors()
			var startcols = {}
			var count = 0;
			for (var i = 0*sw ; i < 5*sw ; i+=sw)
			{
				for (var j = 0*sw ; j < 5*sw ; j+=sw)
				{
					var cc = null;
					if (count==24)
					{
						cc = new Y.GridSquare({x:j+offsetx,y:i+offsety,width:sw,id:count,z:'120',type:'space','color':'trans'})
					}
					else
					{
						cc = new Y.GridSquare({x:j+offsetx,y:i+offsety,width:sw,id:count,z:'120',type:'block','color':colors[count]})
					}
					var newv = new Y.GridSquareView({model:cc});
					if (count==24)
					{
						spaceview = newv;
					}
					startcols[count]=newv.get('model').get('color')[0];
					blockById[count] = newv

					this.get('container').append(newv.get('container'));
					count++;
				}
			}

			if (game.players.self.host || parr.main_instance.hosting)
			{
				game.socket.send('c.ssg.'+Y.JSON.stringify(startcols))  // send set start grid
			}
			currentSnap = startcols;
		},
		getBlockViewByXY:function(x,y)
		{
			ret = false
			for (var i in blockById)
			{
				if (blockById.hasOwnProperty(i))
				{
					var m = blockById[i].get('model')

					if ((m.get('x')-offsetx)==x && (m.get('y')-offsety)==y)
					{
						ret = m.get('color');
						break;
					}
				}
			}
			return ret
		},
		getCenterColors:function()
		{
			bls = {}
			bls[0]=this.getBlockViewByXY(100,100)
			bls[1]=this.getBlockViewByXY(200,100)
			bls[2]=this.getBlockViewByXY(300,100)
			bls[3]=this.getBlockViewByXY(100,200)
			bls[4]=this.getBlockViewByXY(200,200)
			bls[5]=this.getBlockViewByXY(300,200)
			bls[6]=this.getBlockViewByXY(100,300)
			bls[7]=this.getBlockViewByXY(200,300)
			bls[8]=this.getBlockViewByXY(300,300)

			return bls;
		},
		getSnapshot:function()
		{

			var ret = []
			var c = 0
			for (var ii = 0 ; ii < 5 ; ii++)
			{
				for (var j = 0 ; j < 5 ; j++)
				{
					var x = 100*ii
					var y = 100*j

					var found = false
					for (var i in blockspos)
					{
						if (i.length>2) continue
						var xx = blockspos[i][0]
						var yy = blockspos[i][1]
						if (xx==x && yy==y)
						{
							found = true
							ret[c++]= this.getColorFromSquareId(i)
							break
						}
					}
					if (!found)
						if (spacepos[0]==x && spacepos[1]==y)
							ret[c++] = 'trans'
				}
			}
			return ret
		},
		getColorFromSquareId: function(sid)
		{
			ret = 'none'
			Y.Array.each(this.blockviewlist,function(svl)
			{
				var m = svl.get('model')

				if (m.get('id')==sid)
				{
					ret = m.get('color')
				}
			});

			return ret
		},
		getRandomColors:function()
		{
			var colors = ['red','green','blue','yellow','orange','white']
			var c = colors
			for (var i = 0 ; i < 3 ; i++)
			{
				c = c.concat(colors);
			}
			this.shuffle(c)
			this.shuffle(c)
			this.shuffle(c)
			return c;
		},
		shuffle:function(array)
		{
			var currentIndex = array.length, temporaryValue, randomIndex ;
			while (0 !== currentIndex) {
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;
				temporaryValue = array[currentIndex];
				array[currentIndex] = array[randomIndex];
				array[randomIndex] = temporaryValue;
			}

			return array;
		},
		render: function()
		{

			return this;
		}
	});

///////////////////////////////////////////

	Y.GridOpponent = new Y.Base.create('gridopponent',Y.Model,[],
	{
		ATTRS:
		{
			squarewidth:{ value:0 },
			squarenum: { value:0 },
			x:{value:0},
			y:{value:0}
		}
	});
	Y.GridOpponentView = Y.Base.create('gridopponentview',Y.View,[],
	{
		initializer: function()
		{
			var m = this.get('model');
			var c = this.get('container');

			var sw = m.get('squarewidth');
			var sn = m.get('squarenum');
			var offsetx = 740;
			var offsety = 91;
			var count = 0;
			for (var i = 0*sw ; i < 5*sw ; i+=sw)
			{
				for (var j = 0*sw ; j < 5*sw ; j+=sw)
				{
					var cc = new Y.GridSquare({x:j+offsetx,y:i+offsety,width:sw,id:count,z:'110','type':'background','color':0})
					var newv = new Y.GridSquareView({model:cc});
					this.get('container').append(newv.get('container'));
					count++;
				}
			}

			var colors = this.getRandomColors()
			var startcols = {}
			var count = 0;
			for (var i = 0*sw ; i < 5*sw ; i+=sw)
			{
				for (var j = 0*sw ; j < 5*sw ; j+=sw)
				{
					var cc = null;
					if (count==24)
					{
						cc = new Y.GridSquare({x:j+offsetx,y:i+offsety,width:sw,id:count,z:'120',type:'spaceop','color':'trans'})
					}
					else
					{
						cc = new Y.GridSquare({x:j+offsetx,y:i+offsety,width:sw,id:count,z:'120',type:'blockop','color':colors[count]})
					}
					var newv = new Y.GridSquareView({model:cc});
					newv.get('container').setStyle('display','none');
					startcols[count]=newv.get('model').get('color');
					newv.isopponent = true;
					blockByIdOp[count] = newv
					this.get('container').append(newv.get('container'));
					count++;
				}
			}
		},
		setSnapshot:function(snap)
		{
			if (!snap || snap=='undefined') return

			for (var i in blockByIdOp)
			{
				if (blockByIdOp.hasOwnProperty(i))
				{
					var col = colind[snap[i]]
					var b =blockByIdOp[i]

					var path = './images/lose.png';
					if (col!='trans')
						path = './images/'+col+'_small.png'

					b.get('container').one('img').set('src',path)
					b.get('container').setStyle('display','block')
				}
			}
		},
		getRandomColors:function()
		{
			var colors = ['red','green','blue','yellow','orange','white']
			var c = colors
			for (var i = 0 ; i < 3 ; i++)
			{
				c = c.concat(colors);
			}
			this.shuffle(c)
			this.shuffle(c)
			this.shuffle(c)

			return c;
		},
		shuffle:function(array)
		{
		  var currentIndex = array.length, temporaryValue, randomIndex ;

			  while (0 !== currentIndex) {
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;
				temporaryValue = array[currentIndex];
				array[currentIndex] = array[randomIndex];
				array[randomIndex] = temporaryValue;
			  }
			  return array;
		},
		render: function()
		{
			return this;
		}
	});
}, '1.0', {requires: ['gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});
