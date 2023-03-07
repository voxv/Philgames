YUI.add("card", function(Y) {

	var parrframe = parent;
	var parrapp = parent.app.get('activeView');

	Y.Card = new Y.Base.create('card',Y.Model,[],
	{
		ATTRS:
		{
			id:{ value:0 },
			type:{ value:0 },
			special_id: { value:0 },
			number:{ value:0 },
			color:{ value:0 },
			width:{ value:cardwidth },
			x :{ value:0 },
			y :{ value:0 },
			z :{ value:0 },
			inTrash:{ value:0 },
			inDeck:{ value:0 },
		}
	});
	Y.CardView = Y.Base.create('cardview',Y.View,[],
	{
		image:null,
		dd:null,
		drop:null,
		initializer: function()
		{
			var m = this.get('model')
			var c = this.get('container')
			var w = m.get('width');
			var id = m.get('id');
			var par = this
			var startx = 0;
			var startindex = -1

			this.image = Y.Node.create('<img style="position:absolute;" width='+w+' src="./images/cards/'+id+'.png">');
			
			this.get('container').append(this.image);


			c.setStyles({position:'absolute',left:m.get('x'), top:m.get('y')})

			mydata = { id : id }
			this.dd = new Y.DD.Drag({
					node: c,
					data:mydata
				}).plug(Y.Plugin.DDConstrained, {
        		constrain2node: '#wrapper'
    		});
			

			
    		this.dd.on('drag:mouseDown',function(e)
    		{
				var inhand = false
				var cardid = e.target.get('data')['id']
				for (var i =0 ; i < hand.length ; i++)
				{
					if (cardid==hand[i])
					{
						startindex = i
						inhand = true;
						break
					}
				}
				if (!inhand)
				{
					if (!myturn)
					{
						parrapp.playAudio(GAME_NAME,'wrong')
						thisapp.get('activeView').say('Ce n\'est pas ton tour.')
					}
					e.preventDefault();
					return;
				}
    		});

    		this.dd.on('drag:start',function(e)
    		{
				var drag = e.target
				var n = drag.get('node')
				olddragzindex = n.getStyle('zIndex')
				n.setStyle('zIndex',1200)

				var v = n.getXY()
				xdrag = v[0];
				ydrag = v[1];

				var diff = this.startXY[1]-e.pageY
				page_drag_offset = diff

				startx = xdrag
				canplaceOnTrash=false

				var cr = gridview.createTempCells(startx)
				old_current_cell = -1
    		});

    		this.dd.on('drag:drag',function(e)
    		{
				var drag = e.target
				var n = drag.get('node')

				var v = n.getXY()
				xdrag = v[0];
				ydrag = v[1];
				if (inboard)
					e.pageY = e.pageY+page_drag_offset/2
				gridview.displayTempGrid(par,xdrag,ydrag)

    		});

		   this.dd.on('drag:end', function(e) {    // only for trash (see initCards for self order)

		   		var drag = e.target
				var n = drag.get('node')

				

				if (canplaceOnTrash)   // card dropped on trash
				{
					var id = e.target.get('data')['id']

					n.setStyles({position:'absolute',left:trash.currentX, top:trash.currentY})
					trash.incPosition()
					cardviews[drag.get('data')['id']].get('model').set('inTrash',1)
					cardviews[drag.get('data')['id']].image.setStyle('cursor','default');

					var index = hand.indexOf(id)
					if (index!=-1)
					{
						hand.splice(index, 1);
						game.socket.send('c.uh.'+JSON.stringify(hand))
					}
				}
				else if (is_swap)
				{
					if (temp_hand.length==hand.length)
					{

						hand = temp_hand
						game.socket.send('c.uh.'+JSON.stringify(hand))
						gridview.render()
					}
					is_swap = false;
					return
				}
				
				if (hand.length==0)
				{
					won = true
					game.socket.send('c.win.'+game.players.self.id)
				}
				/*else if (hand.length==1)
				{
					//TODO
					game.socket.send('c.su.'+game.players.self.id)  // shout uno
				}*/
				gridview.render();
				trash.render()
			});
		},
		render:function()
		{
			var m = this.get('model')
			var c = this.get('container')
			c.setStyles({position:'absolute',left:m.get('x'), top:m.get('y')})
			this.image.setStyle('zIndex',m.get('z'))
			this.image.setStyle('position','absolute')
			c.setStyle('zIndex',m.get('z'))
		}
	});

	Y.CardGrid = new Y.Base.create('cardgrid',Y.Model,[],
	{
		ATTRS:
		{
			width:{ value:0 },
			division: { value:40 },
			numberOfCards : { value:0 },
			y : { value: 670 }
		}
	});

	Y.CardGridView = Y.Base.create('cardgridview',Y.View,[],
	{
		initializer: function()
		{
			var m = this.get('model');
		},
		createTempCells : function(startx)
		{
			var div = this.get('model').get('division')
			var cell = function(id,x,x2,y,index)
			{
				this.x = x
				this.x2 = x2
				this.y = y
				this.id = id
				this.index = index
			}
			this.cells = []
			this.precell = null

			var ret = -1

			for (var i = 0 ; i < hand.length ; i++)
			{
				cv = cardviews[hand[i]]
				c = cv.get('container')
				cellx = c.getXY()[0]
				celly = c.getXY()[1]

				var offset = cardwidth/2
				if (i==0)
				{
					this.precell = new cell('special',(cellx-div)+offset-120, cellx+offset, celly, -1)
				}

				if (cellx==startx)
					ret = i
				var cellx2 = cellx+div+offset
				cellx += offset
				this.cells.push(new cell(cv.get('model').get('id'),cellx, cellx2, celly, i))
			}
			temp_hand = []
			return ret
		},
		dragGetCurrentCell : function(xdrag,ydrag)
		{
			if (!this.cells) { Y.log('no cells!'); return; }

			var current_cell = -1

			for (var i = 0 ; i < this.cells.length ; i++)
			{
				var thecell = this.cells[i]

				if (inboard)
				{
					if (xdrag>thecell.x && xdrag<thecell.x2 && ydrag>(thecell.y))
					{
						current_cell=thecell
						break
					}
				}
				else
				{
					if (xdrag>thecell.x && xdrag<thecell.x2 && ydrag>(thecell.y-cardheight))
					{
						current_cell=thecell
						break
					}
				}
			}
			if (inboard)
			{
				if (current_cell==-1 && xdrag>this.precell.x && xdrag<this.precell.x2 && ydrag>(this.precell.y))
				{
					current_cell = this.precell
				}
			}
			else
			{
				if (current_cell==-1 && xdrag>this.precell.x && xdrag<this.precell.x2 && ydrag>(this.precell.y-cardheight))
				{
					current_cell = this.precell
				}
			}
			return current_cell
		},
		displayTempGrid : function (par,xdrag,ydrag)
		{
			var reset = false
			var ocell = par.get('model').get('id')
			var mycell = this.dragGetCurrentCell(xdrag,ydrag)
			var nextcell = this.cells[(mycell.index+1)]
			if (nextcell == undefined)
				nextcell = mycell

			mycell = nextcell

			if (mycell.id==undefined)
			{
				par.image.setStyle('width',cardwidth);
				inboard = true
				is_swap = false
			}
			else
			{
				par.image.setStyle('width',cardwidthinhand);
				is_swap = true
				inboard = false
			}

			if (mycell.id!=undefined && mycell.id!=old_current_cell)
			{
				old_current_cell = mycell.id
			}
			else
			{
				if (mycell.id==old_current_cell)
					return
				else if (ydrag<(this.cells[0].y-cardheight))
				{
					reset = true
					old_current_cell = -1
				}
				else return
			}

			temp_hand = []
			var startd = this.get('model').get('division')-gridviewoffset;
			var y = this.get('model').get('y');
			var newd = startd;
			var z = 2
			var count = 0

			if (reset)
			{
				for (var i = 0 ; i < hand.length ; i++)
				{
					if (hand[i]==ocell) continue
					cardviews[hand[i]].get('container').setStyle('left',newd);
					cardviews[hand[i]].get('container').setStyle('top',y);
					cardviews[hand[i]].get('container').setStyle('zIndex',z);
					cardviews[hand[i]].image.setStyle('zIndex',z);
					cardviews[hand[i]].image.setStyle('width',cardwidthinhand);
					temp_hand.push(hand[i])
					z+=2
					newd+=this.get('model').get('division')
				}
			}
			else
			{
				for (var i = 0 ; i < hand.length ; i++)
				{
					if (hand[i]==mycell.id)
						temp_hand.push(ocell)
					if (hand[i]!=mycell.id)
					{
						if (hand[count]==ocell && mycell.id!=ocell)
						{
							count++
						}
						cardviews[hand[count]].get('container').setStyle('left',newd);
						cardviews[hand[count]].get('container').setStyle('top',y);
						cardviews[hand[count]].get('container').setStyle('zIndex',z);
						cardviews[hand[count]].image.setStyle('zIndex',z);
						cardviews[hand[count]].image.setStyle('width',cardwidthinhand);
						temp_hand.push(hand[count])
					}
					else if (mycell.id!=ocell)
					{
						count--
					}
					z+=2

					newd+=this.get('model').get('division')
					count ++
				}
			}
		},
		render : function()
		{
			var c = this.get('container');

			var m = this.get('model');
			if (hand==undefined) return this

			m.set('division',(m.get('width')-gridtighness)/(hand.length+1));

			var startd = m.get('division')-gridviewoffset;
			var newd = startd;
			var z = 3

			for (var i = 0 ; i < hand.length ; i++)
			{
				cardviews[hand[i]].get('container').setStyle('left',newd);
				cardviews[hand[i]].get('container').setStyle('top',m.get('y'));
				cardviews[hand[i]].get('container').setStyle('zIndex',z);
				cardviews[hand[i]].image.setStyle('zIndex',z);
				cardviews[hand[i]].image.setStyle('width',cardwidthinhand);
				cardviews[hand[i]].image.setStyle('cursor','pointer');
				z+=2

				newd+=m.get('division')
			}
			return this
		}
	});


	Y.Deck = new Y.Base.create('deck',Y.Model,[],
	{
		ATTRS:
		{
			cardsTotal:{ value:0 },
			firstCardOnTop : { value :0 },
			x : { value:0 },
			y : { value:0 },
		}
	});


	Y.DeckView = Y.Base.create('deckview',Y.View,[],
	{
		currentX:0,
		currentY:0,
		currentXYcounter:0,
		currentXYMod:deckStackMod,
		initializer: function()
		{
			var m = this.get('model');
			this.currentX = m.get('x')
			this.currentY = m.get('y')
		},
		incPosition:function(force)
		{
			this.currentXYcounter++
			if (force)
			{
				this.currentX+=2
				this.currentY+=2
			}
			else if (this.currentXYcounter%this.currentXYMod==0)
			{
				this.currentX+=2
				this.currentY+=2
			}
		},
		giveCardToPlayer:function(id, withcheck)
		{
			parrapp.playAudio(GAME_NAME,'card_flip')
			
			var cc = cardviews[id]

			cc.get('model').set('inDeck',0)
			deck.render()

			var c = cc.get('container')
			c.setStyle('display','block');
			cc.image.setStyle('display','block')
			c.setStyle('left',this.currentX)
			c.setStyle('top',this.currentY)


			c.setStyle('zIndex',580)
			var par = this
			var animc = new Y.Anim({
				node: c,
				duration : 1
			});

			bypass = true
			animc.set('from', { xy: [par.currentX, par.currentY],opacity:1 });
			animc.set('to', { xy: [par.currentX,gridview.get('model').get('y')],opacity:1 });
			animc.run();
			animc.on('end',function(e)
			{
				if (gridview)
					gridview.render()
				if (par)
					par.render()
			});

			var ret = {}
			ret['cardid'] = id
			ret['nochangeturn'] = 0
			if (withcheck && withcheck!=undefined)
			{
				if (trash.canPlaceCard(id))
				{
					//Y.log('Can place card:'+id)
					ret['nochangeturn'] = id
					game.socket.send('c.gcp.'+JSON.stringify(ret))
					return
				}
			}
			
			game.socket.send('c.gcp.'+JSON.stringify(ret))
		},
		giveCardToPlayerNoSend : function(id)
		{
			parrapp.playAudio(GAME_NAME,'card_flip')
			game.socket.send('c.gcpn.'+topDeckCard)

			var cc = cardviews[id]

			cc.get('model').set('inDeck',0)
			deck.render()

			var c = cc.get('container')
			c.setStyle('display','block');
			cc.image.setStyle('display','block')
			c.setStyle('left',this.currentX)
			c.setStyle('top',this.currentY)


			c.setStyle('zIndex',580)
			var par = this
			var animc = new Y.Anim({
				node: c,
				duration : 1
			});

			bypass = true
			animc.set('from', { xy: [par.currentX, par.currentY],opacity:1 });
			animc.set('to', { xy: [par.currentX,gridview.get('model').get('y')],opacity:1 });
			animc.run();
			animc.on('end',function(e)
			{
				if (gridview)
					gridview.render()
				if (par)
					par.render()
			});
		},
		giveXCardsToPlayer:function(cards)
		{
			var inc = 118
			var posx=inc
			for (var i = 0 ; i < cards.length ; i++)
			{
				var cc = cardviews[cards[i]]
				cc.get('model').set('inDeck',0)

				var c = cc.get('container')
				c.setStyle('display','block');

				var par = this
				var animc = new Y.Anim({
					node: c,
					duration : 1
				});

				animc.set('from', { xy: [this.currentX, this.currentY],opacity:1 });
				animc.set('to', { xy: [posx,gridview.get('model').get('y')],opacity:1 });
				animc.run();
				animc.on('end',function(e)
				{
					cc.get('model').set('inDeck',0)
					Y.Array.each(thisapp.get('activeView').minidecks,function(md)
					{
						md.get('model').set('numberOfCards',cards.length)
						md.render()

					});
					gridview.render()
					par.render()

				});
				posx+=inc
			}
		},
		render:function()
		{
			var c = this.get('container');
			c.empty()
			var m = this.get('model');
			var par = this
			var cardview2
			var z = 2;

			this.currentXYcounter = 0
			this.currentX = deckX
			this.currentY = deckY
			var count = 0

			for (var i in cardviews)
			{
				if (cardviews.hasOwnProperty(i))
				{
					if (cardviews[i].get('model').get('inDeck'))
					{
						var card = new Y.Card({id:0,x:0,y:0,width:cardwidth});
						cardview2 = new Y.CardView({model:card});

						cardview2.get('model').set('x',par.currentX);
						cardview2.get('model').set('y',par.currentY);
						cardview2.get('model').set('z',z);
						cardview2.get('container').setStyle('display','block')
						c.append(cardview2.get('container'))
						cardview2.render()
						if (count==0)
							par.incPosition(1)
						else
							par.incPosition()
						z+=2
						count++
					}
				}
			}

			if (cardview2)
			{
				cardview2.image.detach()
				cardview2.image.setStyle('cursor','default')
				
				cardview2.image.on('mouseover',function(e)
				{
					if (myturn)
						cardview2.image.setStyle('cursor','pointer')
					else
						cardview2.image.setStyle('cursor','default')					
				})
				cardview2.image.on('click',function(e)
				{
					if (!myturn || current_turn_change_pending>0)
					{
						if (!myturn)
						{
							e.preventDefault()
							return							
						}
						if (current_turn_change_pending>0)
						{
							thisapp.get('activeView').say('Tu as d&eacute;j&agrave; pig&eacute.')
							parrapp.playAudio(GAME_NAME,'wrong')
							e.preventDefault()
							return
						}

					}
					par.giveCardToPlayer(topDeckCard,1)
					
				});
			}
			return this
		}
	});

	Y.Trash = new Y.Base.create('trash',Y.Model,[],
	{
		ATTRS:
		{
			cardsTotal:{ value:0 },
			x : { value:0 },
			y : { value:0 },
		}
	});

	Y.TrashView = Y.Base.create('trashview',Y.View,[],
	{
		currentX:0,
		currentY:0,
		currentXYcounter:0,
		currentXYMod:deckStackMod,
		cardorder: [],
		initializer: function()
		{
			var m = this.get('model');
			this.currentX = m.get('x')
			this.currentY = m.get('y')
			var drop = new Y.DD.Drop({
			    node: '#trash_target'
			});


			var par = this
			drop.on('drop:hit', function(e) {
			    var drag = e.drag;

			    var n = drag.get('data');
			    var carddiv = drag.get('node');
			    
				if (!myturn)
				{
					parrapp.playAudio(GAME_NAME,'wrong')
					thisapp.get('activeView').say('Ce n\'est pas ton tour.')
					e.preventDefault()
					return
				}
				
				var cpending_accept = true
				if (current_turn_change_pending>0 && (n['id']!=current_turn_change_pending))
				{
					//cpending_accept = false
					//thisapp.get('activeView').say('Tu ne peux jouer que la carte pig&eacute;e.')
				}
				
				if (par.canPlaceCard(n['id']) && cpending_accept)
				{

				    var drag = e.drag;
	
				    var n = drag.get('data');
				    var carddiv = drag.get('node');
	
					carddiv.setStyle('position','absolute')
					carddiv.setStyle('left',par.currentX)
					carddiv.setStyle('top',par.currentY)
					carddiv.setStyle('zIndex',200)
	
					canplaceOnTrash = true;
					Y.one('#colorCard').hide()

					var card_info = mastercards[n['id']]
					var postpone_sendEvent = false;
					if (card_info['special_id']==4 || card_info['special_id']==3)
						postpone_sendEvent = true;
	
					if (postpone_sendEvent)
					{
						pickedCard=n['id']
	
						if (card_info['special_id']==3)
						{
	
							colorpicker_panel.setStyle('zIndex',9999)
							colorpicker_panel.show();
	
						}
						else
						{
	
							colorpicker_panel2.setStyle('zIndex',9999)
							colorpicker_panel2.show();
	
						}
					}
					
					if (!postpone_sendEvent)
					{
						game.socket.send('c.pont.'+n['id'])  // play on trash
						myturn=false
					}
					parrapp.playAudio(GAME_NAME,'card_flip')
					
					current_turn_change_pending = 0
				}
				else
				{
					canplaceOnTrash = false
					e.preventDefault()
					return					
				}
			});
		},
		canPlaceCard:function(cid)
		{
			var m = this.get('model');
	
			var infoA = mastercards[cid]
			var top = topCardTrash;
			var infoTrash = mastercards[top]

			//Y.log('My data:'+infoA.toSource())
			//Y.log('TrashTop data:'+infoTrash.toSource())
			//Y.log('selectedColor:'+selectedColor)
			if (infoA['type']=='normal')
			{
				if (infoA['color']==infoTrash['color'])
					return true;
				else if (infoA['number']==infoTrash['number'])
					return true;
				if (selectedColor==infoA['color'])
					return true
			}
			else
			{
				if (infoA['color']=='none')
					return true;
				else if (infoA['color']==infoTrash['color'])
					return true
				else if (infoA['special_id']==infoTrash['special_id'])
					return true;

				if (selectedColor==infoA['color'])
					return true


			}
			
			return false;

		},
		clearAll:function()
		{
			deck.render()
			this.render()
		},
		incPosition:function()
		{
			this.currentXYcounter++
			if (this.currentXYcounter%this.currentXYMod==0)
			{
				this.currentX+=2
				this.currentY+=2
			}
		},
		refreshOrder:function(order)
		{
			this.cardorder = []
			var c = this.get('container');

			this.currentX=trashX;
			this.currentY=trashY;

			for (var i in order)
			{
				if (!order.hasOwnProperty(i)) continue
				this.cardorder.push(order[i]);
			}

			if (!in_anim)
				this.render()
			return this
		},
		render:function()
		{
			var c = this.get('container');
			var m = this.get('model');
			var z = 2
			var par = this

			this.currentXYcounter= 0
			this.currentX=trashX
			this.currentY=trashY

			for (var i = 0 ; i < trashorder.length ; i++)
			{
				var id = trashorder[i];
				var mm = cardviews[id].get('model');
				cardviews[id].get('container').setStyle('display','block')

				mm.set('x',this.currentX)
				mm.set('y',this.currentY)
				mm.set('z',z)
				cardviews[id].render()
				this.incPosition()
				z+=10
			}

			for (var i in cardviews)
			{
				if (cardviews.hasOwnProperty(i))
				{
					cardviews[i].image.onclick = null
				}
			}
			var cardview2 = cardviews[trashorder[trashorder.length-1]]
			
			if (cardview2 && cardview2!=undefined)
			{
				topCardTrash = cardview2.get('model').get('id')				
			}
			return this
		}
	});

	Y.MiniDeck = new Y.Base.create('minideck',Y.Model,[],
	{
		ATTRS:
		{
			rotation:{ value:0 },
			player_id:{ value:0 },
			x : { value:0 },
			y : { value:0 },
			division : { value:0 },
			width : { value:0},
			height : { value:0},
			numberOfCards : {value :0 },
			istoright:{value:0}
		}
	});
	Y.MiniDeckView = Y.Base.create('minideckview',Y.View,[],
	{
		vertical:0,
		selected:false,
		initializer: function()
		{
			if (this.get('model').get('rotation')==90 || this.get('model').get('rotation')==270)
			{
				this.vertical = 1;
			}
			else
			{
				this.vertical = 0;
			}

			var c = this.get('container');
			var m = this.get('model');
			var top = m.get('y');
			var left = m.get('x');
			var division = m.get('division')
			if (!this.vertical)
			{
				var w = m.get('width')
				var player_id = m.get('player_id')
				var totalCards = m.get('numberOfCards')
				var div = w/(totalCards);
				div=othergridtighness
				var center = w/2
				var newd = center-(totalCards/2)*div+(div/2)+13

				var names = Y.Node.create('<div class="name_horizontal">'+players_info[player_id]['login_name']+'</div>')
				c.append(names);
			}
			else
			{
				var h = m.get('height')
				var y = m.get('y')
				var istoright = m.get('istoright')
				var player_id = m.get('player_id')
				var totalCards = m.get('numberOfCards')
				var div = h/(totalCards);

				var newd = div
				rank = 1
				var s = ''

				if (players_info[player_id] && players_info[player_id]['login_name'])
					s = players_info[player_id]['login_name']
				else
				{
					s = "quelqu\'un";
				}
				var vertical_s = '';
				for ( var i = 0; i < s.length; i++ )
				{
				 vertical_s+=(s.charAt(i)+'<br>')
				}
				var names = null;
				var left = 0;
				if (istoright)
				{
					names = Y.Node.create('<div class="name_verticalright">'+ vertical_s+'</div>')
					left = 1199
				}
				else
				{
					names = Y.Node.create('<div class="name_vertical">'+ vertical_s+'</div>')
					left = 60
				}
				c.append(names);
			}
		},
		rotateImage : function(imgs,degs)
		{
			imgs.setStyle('-ms-transform','rotate('+degs+'deg)');
			imgs.setStyle('-webkit-transform','rotate('+degs+'deg)');
			imgs.setStyle('transform','rotate('+degs+'deg)');
		},
		addCardFromDeck:function(cardview)
		{
			//Y.log('addCardFromDeck:'+cardview.get('model').get('id'))
			parrapp.playAudio(GAME_NAME,'card_flip')
			cardview.get('model').set('inDeck',0)
			deck.render()

			var m = this.get('model');
			var istoright = m.get('istoright')
			var c = cardview.get('container')
			var rcimg = cardview.image;
			var isvertical = 0;
			var rot = m.get('rotation')
			var par = this
			if (rot==90 || rot==270) isvertical=true

			c.setStyle('display','block');
			var oldSrc = rcimg.get('src')
			rcimg.set('src','./images/cards/0.png')
			rcimg.setStyle('zIndex',300)
			rcimg.setStyle('display','block')

			c.setStyle('opacity',0);
			c.setStyle('left',deckX);
			c.setStyle('top',deckY);

			var animg = new Y.Anim({
				node: c,
				duration : 1
			});
			this.rotateImage(rcimg,rot)
			animg.set('from', { xy: [deckX, deckY],opacity:1,width:cardwidth });

			if (istoright==1)
			{
				animg.set('to', { xy: [1250, verticalCenter],opacity:1,width:cardwidth-10 });
			}
			else if (isvertical==0)
			{
				animg.set('to', { xy: [horizontalCenter, this.get('model').get('y')],opacity:1,width:cardwidth-10 });
			}
			else
			{
				animg.set('to', { xy: [60, verticalCenter],opacity:1,width:cardwidth-10 });
			}

			animg.run();

			animg.on('end', function(e)
			{
				var m = par.get('model');
				var w = m.get('width')-40
				m.set('numberOfCards',m.get('numberOfCards')+1);
				rcimg.set('src',oldSrc)
				par.rotateImage(rcimg,0)
				c.setStyle('display','none')
				par.render();
			});
		},
		addCardFromTrash:function(cardview)
		{
			parrapp.playAudio(GAME_NAME,'card_flip')
			var m = this.get('model');
			var istoright = m.get('istoright')
			var c = cardview.get('container')
			var rcimg = cardview.image;
			var isvertical = 0;
			var rot = m.get('rotation')
			var par = this
			if (rot==90 || rot==270) isvertical=true

			c.setStyle('display','block');
			rcimg.setStyle('zIndex',1300)
			rcimg.setStyle('display','block')
			c.setStyle('zIndex',1300);
			c.setStyle('opacity',0);
			c.setStyle('left',trash.currentX);
			c.setStyle('top',trash.currentY);

			var animg = new Y.Anim({
				node: c,
				duration : 1
			});
			this.rotateImage(rcimg,rot)
			animg.set('from', { xy: [trash.currentX, trash.currentY],opacity:1,width:cardwidth });

			if (istoright==1)
			{
				animg.set('to', { xy: [1250, verticalCenter],opacity:1,width:cardwidth-10 });
			}
			else if (isvertical==0)
			{
				animg.set('to', { xy: [horizontalCenter, this.get('model').get('y')],opacity:1,width:cardwidth-10 });
			}
			else
			{
				animg.set('to', { xy: [60, verticalCenter],opacity:1,width:cardwidth-10 });
			}

			animg.run();

			animg.on('end', function(e)
			{
				var m = par.get('model');
				var w = m.get('width')-40
				m.set('numberOfCards',m.get('numberOfCards')+1);
				par.rotateImage(rcimg,0)
				c.setStyle('display','none')
				par.render();

			});
		},
		putCardOnTrash:function(cardid,color)
		{
			parrapp.playAudio(GAME_NAME,'card_flip')
			var cardview = cardviews[cardid]
			var m = this.get('model');
			var istoright = m.get('istoright')
			var c = cardview.get('container')
			c.setStyle('display','block')
			var rcimg = cardview.image;
			rcimg.setStyle('width',cardwidth)
			var isvertical = 0;
			var rot = m.get('rotation')
			var par = this
			if (rot==90 || rot==270) isvertical=true

			rcimg.set('src','./images/cards/'+cardid+'.png')
			rcimg.setStyle('zIndex',1000)
			c.setStyle('zIndex',1000);
			rcimg.setStyle('display','block')

			var startx = m.get('x')
			var starty = m.get('y')

			c.setStyle('opacity',0);
			c.setStyle('left',startx);
			c.setStyle('top',starty);

			var index = hands[m.get('player_id')].indexOf(cardid)
			if (index!=-1)
				hands[m.get('player_id')].splice(index, 1);

			this.get('model').set('numberOfCards',this.get('model').get('numberOfCards')-1)
			this.render()

			var animg = new Y.Anim({
				node: c,
				duration : 1
			});
			this.rotateImage(rcimg,rot)
			animg.set('to', { xy: [trash.currentX, trash.currentY],opacity:1,width:cardwidth });

			if (istoright==1)
			{
				animg.set('from', { xy: [1250, verticalCenter],opacity:1,width:cardwidth-10 });
			}
			else if (isvertical==0)
			{
				animg.set('from', { xy: [horizontalCenter, 60],opacity:1,width:cardwidth-10 });
			}
			else
			{
				animg.set('from', { xy: [60, verticalCenter],opacity:1,width:cardwidth-10 });
			}

			animg.run();

			animg.on('end', function(e)
			{

				par.rotateImage(rcimg,0)
				in_anim = false
				if (trash && trash!=undefined)
					trash.render()
				
				if (color)
				{
					var c = Y.one('#colorCard')
					c.setStyle('position','absolute')
					c.setStyle('left',trashX-10)
					c.setStyle('top',trashY-10)
					c.setStyle('width',colorselectedblockwidth)
					c.setStyle('height',colorselectedblockheight)
					if (color=='blue')
						c.setStyle('backgroundImage',"url('images/blue.png')")
					else if (color=='yellow')
						c.setStyle('backgroundImage',"url('images/yellow.png')")
					else if (color=='green')
						c.setStyle('backgroundImage',"url('images/green.png')")
					else if (color=='red')
						c.setStyle('backgroundImage',"url('images/red.png')")
					c.setStyle('zIndex',2)
					c.show()
					selectedColor = color
				}
			});
		},
		putCardOnTrashColor:function(cardid,color)
		{
			this.putCardOnTrash(cardid,color)
		},
		giveXCardsToPlayer:function(cards)
		{
			//Y.log('giveXCardsToPlayer:'+cards.toSource())
			parrapp.playAudio(GAME_NAME,'card_flip')
			var inc = 40
			var posx=inc
			var m = this.get('model')
			var par = this

			var istoright = m.get('istoright')
			var isvertical = 0;
			var rot = m.get('rotation')
			var par = this
			if (rot==90 || rot==270) isvertical=true

			if (isvertical)
			{
				posx = verticalCenter - this.get('model').get('numberOfCards')*cardwidth-200

				inc = cardwidth-10
			}
			else
			{
				posx = horizontalCenter - this.get('model').get('numberOfCards')*cardwidth-220

				inc = cardwidth
			}
			for (var i = 0 ; i < cards.length ; i++)
			{
				var cc = cardviews[cards[i]]

				cc.get('model').set('inDeck',0)

				this.rotateImage(cc.image,m.get('rotation'))
				var oldSrc = cc.image.get('src')
				cc.image.set('src','./images/cards/0.png')
				cc.image.setStyle('width',cardwidth-10)
				cc.image.setStyle('display','block')
				var c = cc.get('container')
				c.setStyle('display','block');
				c.setStyle('zIndex','1000');
				cc.image.setStyle('zIndex','1000');
				c.setAttribute('id','c_'+i)

				var animc = new Y.Anim({
					node: c,
					duration : 1
				});

				animc.set('from', { xy: [deck.currentX, deck.currentY],opacity:1 });

				if (istoright==1)
				{
					animc.set('to', { xy: [1250, posx],opacity:1 });
				}
				else if (isvertical==0)
				{
					animc.set('to', { xy: [posx, 60],opacity:1 });
				}
				else
				{
					animc.set('to', { xy: [60, posx],opacity:1 });
				}

				animc.on('end',function(e)
				{
					var d = e.target.get('node')
					par.rotateImage(cc.image,0)
					cc.image.set('src',oldSrc)
					d.setStyle('display','none')

				});

				posx+=inc
				animc.run();
			}
			deck.render()
		},
		highlightName : function()
		{
			if (this.mynamediv!=undefined)
			{
				this.mynamediv.setStyle('backgroundColor',highlighted_name_color)
				this.selected = true
			}
		},
		resetHighlightName : function()
		{
			if (this.mynamediv!=undefined)
			{
				this.mynamediv.setStyle('backgroundColor',normal_name_color)
				this.selected = false
			}
		},
		render:function()
		{
			var c = this.get('container');
			c.empty()
			var m = this.get('model');

			var vertical = 0;
			if (this.get('model').get('rotation')==90 || this.get('model').get('rotation')==270)
				vertical = 1;
			var totalCards = m.get('numberOfCards')
			var thishand = hands[m.get('player_id')]
			if (thishand && thishand!=undefined)
			//Y.log('MY HAND:'+thishand.toSource())
			if (!this.vertical)
			{
				var w = m.get('width')
				var player_id = m.get('player_id')

				var div = w/(totalCards);
				div=othergridtighness
				var center = w/2
				var newd = center-(totalCards/2)*div+(div/2)+13-20

				var names = this.mynamediv = Y.Node.create('<div class="name_horizontal">'+players_info[player_id]['login_name']+'</div>')
				if (this.selected)
				{
					this.mynamediv.setStyle('backgroundColor',highlighted_name_color)
				}
				else
				{
					this.mynamediv.setStyle('backgroundColor',normal_name_color)
				}
				c.append(names);
				rank = 1

				if (thishand==undefined) return this

				for (var i = 0 ; i < thishand.length ; i++)
				{
					var n = Y.Node.create('<img class="mini_deck" src="./images/cards/0.png">')
					n.setStyle('position','absolute');
					n.setStyle('top',m.get('y'));
					n.setStyle('left',newd);
					n.set('height',cardwidth-10)
					this.rotateImage(n,m.get('rotation'))
					c.append(n);
					newd = newd+div;
				}
			}
			else
			{
				var h = m.get('height')
				var y = m.get('y')
				var istoright = m.get('istoright')
				var player_id = m.get('player_id')

				var div = h/(totalCards+15);
				div=othergridtighness-10
				var center = verticalCenter
				var newd = center-(totalCards/2)*div+(div/2)+13
				rank = 1
				var s = ''

				if (players_info[player_id] && players_info[player_id]['login_name'])
					s = players_info[player_id]['login_name']
				else
				{
					s = "quelqu\'un";
				}
				var vertical_s = '';
				for ( var i = 0; i < s.length; i++ )
				{
				 vertical_s+=(s.charAt(i)+'<br>')
				}
				var names = null;
				var left = 0;
				if (istoright)
				{
					names = this.mynamediv = Y.Node.create('<div class="name_verticalright"><div style="display: table-cell; vertical-align: middle; padding:0px;">'+ vertical_s+'</div></div>')
					left = 1099
				}
				else
				{
					names = this.mynamediv = Y.Node.create('<div class="name_vertical"><div style="display: table-cell; vertical-align: middle; padding:0px;">'+ vertical_s+'</div></div>')
					left = 60
				}
				if (this.selected)
				{
					this.mynamediv.setStyle('backgroundColor',highlighted_name_color)
				}
				else
				{
					this.mynamediv.setStyle('backgroundColor',normal_name_color)
				}
				c.append(names);

				if (thishand==undefined) return this

				for (var i = 0 ; i < thishand.length ; i++)
				{
					var n = Y.Node.create('<img class="mini_deck" src="./images/cards/0.png">')
					n.setStyle('position','absolute');
					n.setStyle('top',newd);
					if (m.get('istoright'))
						n.setStyle('left',1200);
					else
						n.setStyle('left',47);
					n.set('height',cardwidth-10)
					this.rotateImage(n,m.get('rotation'))
					c.append(n);
					newd = newd+div;
				}
			}

		}
	});
}, '1.0', {requires: ['transition','json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});