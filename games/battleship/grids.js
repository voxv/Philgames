YUI.add("grids", function(Y) {

	var parrframe = parent
	var parrapp = parrframe.app.get('activeView')

	Y.GridPlayerSquare = new Y.Base.create('gridplayersquare',Y.Model,[],
	{
		ATTRS:
		{
			x:{ value:0 },
			y: { value:0 },
			absolutex: { value:0 },
			absolutey: { value:0 },
			width: { value:0 },
			id:{value:0},
			hoverable:{value:0},
			status: { value:0 }     // 0 hidden, 1 water , 2 ship
		}
	});
	Y.GridPlayerSquareView = Y.Base.create('gridplayersquareview',Y.View,[],
	{
		graph:null,
		initializer: function() { },
		getRealX: function()
		{
			var m = this.get('model');
			return m.get('absolutex') + m.get('x');
		},
		getRealY: function()
		{
			var m = this.get('model');
			return m.get('absolutey') + m.get('y');
		},
		resetMouseDown:function(dry)
		{
			if (!dry)
			{
				var m = this.get('model');
				if (m.get('status') == 0)
					this.render();
				else
					this.get('container').setStyle('cursor','default')
			}
			else
				this.get('container').setStyle('cursor','default')
		},
		executeMove:function(e)
		{
			var m = this.get('model');
			var c = this.get('container');

			if (m.get('status') != 0) return this;
			var posx = m.get('absolutex') + m.get('x');
			var posy = m.get('absolutey') + m.get('y');

			//var node = Y.Node.create('<div style=" position:absolute; top:'+posy+'px; left:'+posx+'px; width:'+m.get('width')+'px; height:'+m.get('width')+'px;"><img width='+m.get('width')+' height='+m.get('width')+' src="battleship/images/single.png"></div>');

			var par = this;

					if (!myturn) return
					myturn = false;
					if (m.get('status')==0)
					{
						//var pshipsother = JSON.parse(players_ships['other'])
						var pshipsother = null;
						var pships_ori = null;

						if (game.players.self.host || parrframe.main_instance.hosting)
						{
							pships_ori = players_ships['other'];
						}
						else
						{
							pships_ori = players_ships['host'];
						}
						pshipsother = JSON.parse(pships_ori);
						//console.log(pshipsother.toSource());

						found = false;
						thisid = m.get('id');

						cp = pshipsother;
						completed = false

						g_view = null;

						if (inArray(thisid,pshipsother['c1']))
						{
							found_ships['c1'].push(thisid)
							if(found_ships['c1'].sort().join(',')=== cp['c1'].sort().join(','))
							{
								var min = Math.min.apply(null, cp['c1'])
								newv = thisapp.get('activeView').gridplayerviewClickable;
								var s = new Y.StaticShip({x:newv.getCoords(min)[0],y:newv.getCoords(min)[1],image:'./images/ship1.png',width:250,height:50,numSquares:5,isvertical:thisapp.get('activeView').checkVertical(cp['c1'])});
								var sview = new Y.StaticShipView({model:s});
								g_view = sview
								thisapp.get('activeView').get('container').append(sview.render().get('container'));
								completed = true;
							}
							found = true;
						}

						if (!found && inArray(thisid,pshipsother['c2']))
						{
							found_ships['c2'].push(thisid)
							if(found_ships['c2'].sort().join(',')=== cp['c2'].sort().join(','))
							{
								var min = Math.min.apply(null, cp['c2'])
								newv = thisapp.get('activeView').gridplayerviewClickable;
								var s = new Y.StaticShip({x:newv.getCoords(min)[0],y:newv.getCoords(min)[1],image:'./images/ship2.png',width:200,height:50,numSquares:4,isvertical:thisapp.get('activeView').checkVertical(cp['c2'])});
								var sview = new Y.StaticShipView({model:s});
								g_view = sview
								thisapp.get('activeView').get('container').append(sview.render().get('container'));
								completed = true;
							}
							found = true;
						}

						if (!found && inArray(thisid,pshipsother['c3']))
						{
							found_ships['c3'].push(thisid)
							if(found_ships['c3'].sort().join(',')=== cp['c3'].sort().join(','))
							{
								var min = Math.min.apply(null, cp['c3'])
								newv = thisapp.get('activeView').gridplayerviewClickable;
								var s = new Y.StaticShip({x:newv.getCoords(min)[0],y:newv.getCoords(min)[1],image:'./images/ship3.png',width:150,height:50,numSquares:3,isvertical:thisapp.get('activeView').checkVertical(cp['c3'])});
								var sview = new Y.StaticShipView({model:s});
								g_view = sview
								thisapp.get('activeView').get('container').append(sview.render().get('container'));
								completed = true;
							}
							found = true;
						}

						if (!found && inArray(thisid,pshipsother['c4']))
						{
							found_ships['c4'].push(thisid)
							if(found_ships['c4'].sort().join(',')=== cp['c4'].sort().join(','))
							{

								var min = Math.min.apply(null, cp['c4'])
								newv = thisapp.get('activeView').gridplayerviewClickable;
								var s = new Y.StaticShip({x:newv.getCoords(min)[0],y:newv.getCoords(min)[1],image:'./images/ship4.png',width:150,height:50,numSquares:3,isvertical:thisapp.get('activeView').checkVertical(cp['c4'])});
								var sview = new Y.StaticShipView({model:s});
								g_view = sview
								thisapp.get('activeView').get('container').append(sview.render().get('container'));
								completed = true;
							}
							found = true;
						}

						if (!found && inArray(thisid,pshipsother['c5']))
						{
							found_ships['c5'].push(thisid)
							if(found_ships['c5'].sort().join(',')=== cp['c5'].sort().join(','))
							{

								var min = Math.min.apply(null, cp['c5'])

								newv = thisapp.get('activeView').gridplayerviewClickable;
								var s = new Y.StaticShip({x:newv.getCoords(min)[0],y:newv.getCoords(min)[1],image:'./images/ship5.png',width:100,height:50,numSquares:2,isvertical:thisapp.get('activeView').checkVertical(cp['c5'])});
								var sview = new Y.StaticShipView({model:s});
								g_view = sview
								thisapp.get('activeView').get('container').append(sview.render().get('container'));


								completed = true;
							}
							found = true;
						}
						comp = 0;
						if (completed)
						{
								var shippos = g_view.get('container').one('img').getXY();

								for (var i = 0 ; i < g_view.get('model').get('numSquares') ; i++)
								{
									var w = 80;
									var nodee = null;
									if (g_view.get('model').get('isvertical'))
									{
										nodee = Y.Node.create('<div style="z-index:35; position:absolute; top:'+(shippos[1]-12+(i*m.get('width')))+'px; left:'+(shippos[0]-15)+'px; width:'+w+'px; height:'+w+'px;"><img width='+w+' height='+w+' src="./images/giphy.gif"></div>');
									}
									else
									{
										nodee = Y.Node.create('<div style="z-index:35; position:absolute; top:'+(shippos[1]-12)+'px; left:'+(shippos[0]+(i*m.get('width'))-12)+'px; width:'+w+'px; height:'+w+'px;"><img width='+w+' height='+w+' src="./images/giphy.gif"></div>');
									}

									par.get('container').append(nodee)

									var anim = new Y.Anim({
										node: nodee,
										from: { opacity: 1 },
										to: { opacity: 0 },
										duration : 5
									});
									anim.on('end', function()
									{
										var n = this.get('node');
										n.get('parentNode').removeChild(n);
									});
									anim.run();
								}
								if ((ships_sunken+1)!=5)
								{
									var audio0 = new Audio('./sounds/bigboom.mp3');
									audio0.loop = false;
									audio0.play();
									parrapp.playAudio(GAME_NAME,'bomb1');
								}

								comp = 1;
								thisapp.get('activeView').sayCentered('Capitaine! Nous avons d&eacute;truit un bateau!');
						}
						ishit = 0;
						if (found)
						{
							ishit = 1;
							myturn = true;
							par.get('model').set('status',2);
							par.get('container').append('<div class="fire" style="z-index:35; position:absolute; top:'+(posy-12)+'px; left:'+posx+'px; width:'+m.get('width')+'px; height:'+m.get('width')+'px;"><img width='+m.get('width')+' height='+m.get('width')+' src="./images/fire_anim.gif"></div>');

							if ((ships_sunken+1)!=5)
								parrapp.playAudio(GAME_NAME,'bomb1');
						}
						else
						{
							parrapp.playAudio(GAME_NAME,'splash1');

							par.get('model').set('status',1);
							var nodee = Y.Node.create('<div style="z-index:35; position:absolute; top:'+(posy-12-22)+'px; left:'+(posx-18)+'px; width:'+m.get('width')+'px; height:'+m.get('width')+'px;"><img width=90 height=90 src="./images/splouch.gif"></div>')
							par.get('container').append(nodee);
							var anim = new Y.Anim({
							    node: nodee,
							    from: { opacity: 1 },
							    to: { opacity: 1 },
							    duration : 1
							});

							parnode = e.currentTarget
							anim.on('end', function()
							{
								var n = this.get('node');

								//alert(parnode)

								parnode.set('src','./images/single_white.png')

								 n.get('parentNode').removeChild(n);

							});
							anim.run();

						}

						var tosend = {'square':par.get('model').get('id'), 'ishit':ishit , 'completed':comp }

						game.socket.send('c.rm.'+Y.JSON.stringify(tosend))    //record move

						// TODO

						/*data = { 'thisplayer':playerInfo['id'], 'action':'recordmove', 'square':par.get('model').get('id'), 'ishit':ishit , 'completed':comp }

						Y.io('index.ajax.php', {
							method: 'POST',
							data: data,
							on: {
								success: function(id,response) { },
								failure: function(transactionid, response, arguments){  }
							}
						});*/

						if (ishit==0)
						{
							if (myturn)
								thisapp.get('activeView').say('C\'est ton tour.');
							else
							{
								if (game.players.other.login_name.length > 0)
									thisapp.get('activeView').say('C\'est &agrave; '+otherplayername+'.');
							}
						}

						par.get('container').one('img').setStyle('cursor','default');
						par.render();

						if (completed)
						{
							ships_sunken++;
							if (ships_sunken>=5)
							{
								won = 1;
								clickblock=true;
								myturn=false;
								//lastwon=playerInfo['id'];
								thisapp.get('activeView').playGameOver()

								return;
							}
						}
					}
		},
		render: function()
		{
			var m = this.get('model');
			var c = this.get('container');

			if (m.get('status') != 0) return this;
			var posx = m.get('absolutex') + m.get('x');
			var posy = m.get('absolutey') + m.get('y');

			var node = Y.Node.create('<div style=" position:absolute; top:'+posy+'px; left:'+posx+'px; width:'+m.get('width')+'px; height:'+m.get('width')+'px;"><img width='+m.get('width')+' height='+m.get('width')+' src="./images/single.png"></div>');

			var par = this;

			if (myturn && m.get('hoverable')==1 && !clickblock)
			{
				node.setStyle('zIndex',29);

				node.one('img').onmouseout = null;
				node.one('img').on('mouseout',function(e)
				{
					if (!myturn || clickblock)
					{

						return
					}
					if (m.get('status')==0)
					node.one('img').set('src','./images/single.png');
					node.one('img').setStyle('cursor','default');
				});
				node.one('img').onmouseover = null;
				node.one('img').on('mouseover',function(e)
				{
					if (!myturn || clickblock)
					{

						return
					}
					par.graph.removeAllShapes();

					if (m.get('status')==0)
					{
						node.one('img').setStyle('cursor','pointer');
						node.one('img').set('src','./images/single_light.png');
					}
				});

				node.one('img').onclick = null;
				node.one('img').on('click',function(e)
				{
					if (!myturn || clickblock) {
						if (!clickblock)
						thisapp.get('activeView').say('Ce n\'est pas ton tour.');
						return;
					}
					clickblock = true;
					var f = function()
					{
						par.executeMove(e)
						clickblock = false;
					}
					//parrapp.playAudio(GAME_NAME,'missle_pass',f)
					f()


				})
			}
			else   // not my turn
			{

				node.one('img').setStyle('cursor','default')
			}
			c.append(node);


			return this;
		}
	});

	Y.GridPlayer = new Y.Base.create('gridplayer',Y.Model,[],
	{
		ATTRS:
		{
			width:{ value:0 },
			division: { value:0 },
			offsetx:{ value:0 },
			offsety:{ value:0 },
			hoverable:{value:0}
		}
	});
	Y.GridPlayerView = Y.Base.create('gridplayerview',Y.View,[],
	{
		squarelist : 0,
		minigrid_graphic : null,
		squareviewlist : [],
		setToWhite: function(sqid)
		{
			found=false;

			Y.Array.each(this.squareviewlist,function(svl)
			{
				var m = svl.get('model')
				if (m.get('id')==sqid)
				{
					if (!found)
					{

						img = svl.get('container').one('img')
						img.set('src','./images/single_white.png')
						found=true
					}
				}
			});
		},
		resetMouseDown:function()
		{
			for (i = 0 ; i < this.squareviewlist.length ; i++)
			{
				this.squareviewlist[i].resetMouseDown();
			}

		},
		initializer: function()
		{
			var m = this.get('model');
			var c = this.get('container');

			this.squareviewlist=[];

			c.append("<div id='mygridview'></div>");

			squarelist = this.squarelist = new Y.ModelList();
			squarelist.after('add',this.addSquareToList,this);

			var w = m.get('width');
			var div = m.get('division');
			var inc = Math.floor(w/div);

			var offx = m.get('offsetx');
			var offy = m.get('offsety');

			this.minigrid_graphic = new Y.Graphic({render: "#draw_mini"});
			this.minigrid_graphic.removeAllShapes();

			hoverable = m.get('hoverable');
			count = 0;
			for (var i = 0 ; i < w ; i+=inc)
			{
				for (var j = 0 ; j < w ; j+=inc)
				{
					squarelist.add(new Y.GridPlayerSquare({x:i,y:j,width:inc,absolutex:offx,absolutey:offy,id:count,hoverable:hoverable,status:0}));
					count++;
				}
			}
		},
		getXYFromSquareId: function(sid)
		{
			ret = []
			Y.Array.each(this.squareviewlist,function(svl)
			{
				var m = svl.get('model')

				if (m.get('id')==sid)
				{

					if (ret.length < 3)
					{
						ret.push(svl.getRealX())
						ret.push(svl.getRealY())
					}
				}
			});

			return [ret[0],ret[1]]
		},
		addSquareToList: function(e)
		{

			list = e.currentTarget;
			list_size = list.size()-1;
			var newv = new Y.GridPlayerSquareView({model:list.item(list_size)});

			newv.graph = this.minigrid_graphic;
			this.squareviewlist.push(newv);

			newv.render();

			this.get('container').append(newv.get('container'));
		},
		getCoords: function(id)
		{
			ret = [];
			var m = this.get('model');
			var offx = m.get('offsetx');
			var offy = m.get('offsety');

			Y.Array.each(this.squareviewlist, function(sq)
			{
				m = sq.get('model');

				if (id == m.get('id'))
				{
					ret.push(m.get('x')+offx);
					ret.push(m.get('y')+offy);
				}
			});
			return ret;
		},
		render: function()
		{
			//for (var i = 0 ; i < this.squareviewlist.length ; i++)
			//	this.squareviewlist[i].render();
			return this;
		}
	});


	Y.MyGridSquare = new Y.Base.create('mygridsquare',Y.Model,[],
	{
		ATTRS:
		{
			x:{ value:0 },
			y: { value:0 },
			width: { value:0 }
		}
	});
	Y.MyGridSquareView = Y.Base.create('mygridsquareview',Y.View,[],
	{
		graph:null,
		xoffset:490,
		yoffset:141,
		highlight: 0,
		initializer: function() { },
		render: function()
		{
			var m = this.get('model');
			var c = this.get('container');

			var posx = this.xoffset + m.get('x');
			var posy = this.yoffset + m.get('y');
			opac = 0;
			if (this.highlight==1)
			{
				opac = 1;
			}

			c.append('<div style="position:absolute; top:'+posy+'px; left:'+posx+'px; width:'+m.get('width')+'px; height:'+m.get('width')+'px;"><img width='+m.get('width')+' height='+m.get('width')+' src="./images/single.png"></div>');
			return this;
		},
		isinside: function(x,y)
		{
			var m = this.get('model');

			var posx = this.xoffset + m.get('x');
			var posy = this.yoffset + m.get('y');
			if (x>=m.get('x')+this.xoffset && x<(m.get('x')+this.xoffset+m.get('width')) && y>=m.get('y')+this.yoffset && y<(m.get('y')+this.yoffset+m.get('width')))
			{
				return true;
			}
			return false;
		},
		highlight: function()
		{
			this.highlight = 1;
		},
		ATTRS:
		{
			graph:{ value:0 },
		}
	});
	Y.MyGrid = new Y.Base.create('mygrid',Y.Model,[],
	{
		ATTRS:
		{
			width:{ value:0 },
			division: { value:0 },
		}
	});
	Y.MyGridView = Y.Base.create('mygridview',Y.View,[],
	{
		squarelist : 0,
		minigrid_graphic : null,
		squareviewlist : [],
		initializer: function()
		{
			var m = this.get('model');
			var c = this.get('container');

			c.append("<div id='mygridview'></div>");

			squarelist = this.squarelist = new Y.ModelList();
			squarelist.after('add',this.addSquareToList,this);

			var w = m.get('width');
			var div = m.get('division');
			var inc = Math.floor(w/div);

			this.minigrid_graphic = new Y.Graphic({render: "#draw_mini"});
			this.minigrid_graphic.removeAllShapes();
			for (var i = 0 ; i < w ; i+=inc)
			{
				for (var j = 0 ; j < w ; j+=inc)
				{
					squarelist.add(new Y.MyGridSquare({x:i,y:j,width:inc}));
				}
			}

		},
		printSquares: function() { },
		addSquareToList: function(e)
		{
			list = e.currentTarget;
			list_size = list.size()-1;
			var newv = new Y.MyGridSquareView({model:list.item(list_size)});
			newv.graph = this.minigrid_graphic;
			this.squareviewlist.push(newv);

			newv.render();
			this.get('container').append(newv.get('container'));
		},
		snap: function(x,y)
		{
			if (this.squareviewlist=='undefined' || this.squareviewlist==undefined || this.squareviewlist==null) return;

			for (var i = 0 ; i  < this.squareviewlist.length ; i++)
			{
				var isin = this.squareviewlist[i].isinside(x+25,y+25);
				if (isin)
				{
					return [this.squareviewlist[i].get('model').get('x')+this.squareviewlist[i].xoffset,this.squareviewlist[i].get('model').get('y')+this.squareviewlist[i].yoffset];
				}
			}
			return [x,y]
		},
		getTargetSquares:function(x,y,w,h,l)
		{
			ret = [];
			x = x - this.squareviewlist[0].xoffset;
			y = y - this.squareviewlist[0].yoffset;
			count = 0;
			for (var i = 0 ; i  < this.squareviewlist.length ; i++)
			{
				var mod = this.squareviewlist[i].get('model');
				if (mod.get('x')==x && mod.get('y')==y)
				{
					count=i;
					break;
				}
			}
			vertical = true;

			if (w>h) vertical=false;

			var tot =0;
			if (vertical)
			{
				for (var i = 0 ; i  < w ; i+=10)
				{
					tot++;
					if (tot>l) break;
					ret.push(count++);
				}
			}
			else
			{
				for (var i = 0 ; i  < h ; i+=10)
				{
					tot++;
					if (tot>l) break;
					ret.push(count+i);
				}
			}

			return ret;
		},
		render: function()
		{
			return this;
		}
	});


}, '1.0', {requires: ['gallery-audio','json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});
