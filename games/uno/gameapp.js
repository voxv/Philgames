YUI.add("gameapp", function(Y) {

	var console = new Y.Console();
	//console.render();

	var parrframe = parent;
	var parrapp = parent.app.get('activeView');

	Y.Login = Y.Base.create('login',Y.View,[],
	{
		container: '<div>',
		initializer: function(){ },
		login: function()
		{
			var login_name = Y.one('#name').get('value');
			if (login_name.length<1) { alert('Tu dois ecrire quelque chose D:'); return; }

    		game.client_connect_to_server(login_name);
		},
		checkkey: function(e)
		{
			if (e.keyCode === 13) this.login();
		},
		events: {
			'#enterbutton': {click: 'login'},
			'#name': {keypress: 'checkkey'}
		},
		render: function()
		{
			return this
		}
	});

	Y.Home = Y.Base.create('home',Y.View,[],
	{
		backimg:null,
		homeheadview:null,
		chatview:null,
		initializer: function()
		{
			this.reinit()
			game.players.self.login_name=parrframe.main_instance.login_name

			var playerlistview = this.playerlistview = new Y.PlayerListView();
			var thisplayer = this.thisplayer = new Y.Player({id:0,login_name:parrframe.main_instance.login_name});

			playerlistview.playerlist.add(thisplayer);

			var chatview = this.chatview = new Y.ChatView();

			this.backimg = Y.Node.create('<div style="z-index:-1; position:absolute; left:0px; top:0px;"><img src="./images/back.jpg" style="width:1290; height:650px;"/></div>');
			Y.one('#wrapper').append(this.backimg);

			this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:'Bienvenue &agrave; Uno!'}));
			if (game.players.self.host && !gamestarted)
				this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:'En attente d\'un adversaire'}));

			game.client_connect_to_server(parrframe.main_instance.login_name);

			if (parrframe.main_instance.hosting && parrframe.main_instance.reconnected)
			{
				game.socket.send('c.hl.')
				game.players.self.host=true
			}

			parrframe.main_instance.reconnected = false;
			game.socket.send('c.l.'+parrframe.main_instance.login_name)
			game.players.self.login_name=parrframe.main_instance.login_name;
			this.homeheadview = new Y.HomeHeadView();
		},
		reinit:function()
		{
		
			myturn = 0;
			currentTurn = ''
			otherplayermodels = {}
			hands = {}
			hand = []
			inboard = false
			first_turn_notice = false
			is_in_anim = 0;
			is_swap = false
			cardsinited = false;
			gamerestart = 1
			olddragzindex = 0
			oldZIndex = 0
			temp_hand = []
			old_current_cell = -1
			playerOrder = null
			canplaceOnTrash = false
			trashorder = 0
			currentTurn=0
			deck = null;
			deckview = null;
			trash = null;
			trashview = null;
			xdrag = 0;
			ydrag = 0;
			mastercards = {}
			topCardTrash = 0
			colorpicker_panel = null;
			colorpicker_panel2 = null;
			divblue = null
			divyellow = null
			divgreen = null
			divred = null
			selectedColor = ''
			stfu = false;
			selectedColorId = 0
			pickedCard = 0
			totalCardsInDeck = 0;
			won = false;
			total_players = 0
			unoAlreadyShouted = false

			Y.one('#placement_message2').setStyle('display','none')
			Y.one('#dialog').setStyle('display','none')
			Y.one('#dialog2').setStyle('display','none')

		},
		loginOtherPlayer: function(playerid)
		{
			var pl = game.players.others[playerid].login_name

			if (!otherplayermodels[playerid] || otherplayermodels[playerid]==undefined)
			{
				otherplayermodels[playerid] = new Y.Player({login_name:pl});

				this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:game.players.others[playerid].login_name+' s\'est joint &agrave; la partie'}));
			}

			this.playerlistview.playerlist.add(otherplayermodels[playerid]);

			if (game.players.self.host || parrframe.main_instance.hosting)
				this.activateGoButton()

			players_info[playerid] = { login_name:pl }
		},
		onPageShow:function(e)
		{
			Y.log('show!!!');
		},
		activateGoButton:function()
		{
			var m = this.get('container').one('#buttondiv');
			m.setStyle('display','block');
		},
		deactivateGoButton:function()
		{
			var m = this.get('container').one('#buttondiv');
			if (m)
				m.setStyle('display','none');
		},
		removeOtherPlayer: function(cid)
		{
			game.socket.send('c.l.'+game.players.self.login_name)

			var oldln = game.players.others[cid].login_name;
			this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:oldln+' a quitt&eacute;... En attente d\'un autre adversaire'}));

			if (otherplayermodels[cid])
			{
				this.playerlistview.playerlist.remove(otherplayermodels[cid]);
				this.playerlistview.render();
			}
			delete otherplayermodels[cid]
			delete game.players.others[cid]
			this.updateScore()
			this.deactivateGoButton()
			this.homeheadview.eraseOther();
			delete players_info[cid]
			delete game.players.others[cid]
		},
		updateScore:function()
		{
			this.homeheadview.updateScore();
		},
		startGame:function(player_order)
		{
			playerOrder = JSON.parse(player_order)
			this.backimg.setStyle('display','none');
			gamestarted = true;
			thisapp.showView('game');
		},
		render: function()
		{
			var masterdiv = Y.Node.create('<div class="placement_master_home"></div>')
			masterdiv.append(this.homeheadview.get('container'));

			var submaster  = Y.Node.create('<div class="placement_sub_master"></div>')

			var leftpanel = Y.Node.create('<div class="placement_leftpanel_home"></div>');

			leftpanel.append(this.playerlistview.render().get('container'));
			var par = this

			buttonDiv = Y.Node.create('<div id="buttondiv" class="start_game_button" style="display:none"><button class="startbutton" id="startbutton">GO!</button></div>');
			buttonDiv.one('#startbutton').on('click',function(e)
			{
					game.socket.send('c.sg.');
			});
			buttonDiv.one('#startbutton').on('touchstart',function(e)
			{
					game.socket.send('c.sg.');
			});
			leftpanel.append(buttonDiv);

			var bottompanel = Y.Node.create('<div class="placement_bottompanel_home"></div>');
			bottompanel.append(this.chatview.render().get('container'));

			submaster.append(leftpanel);
			submaster.append(bottompanel);
			masterdiv.append(submaster)
			this.get('container').append(masterdiv)
		}
	});

	Y.Game = Y.Base.create('game',Y.View,[],
	{
		grids1:null,
		grids2:null,
		minigrid:null,
		started:false,
		message_top_anim:null,
		minidecks:[],
		backimg:null,
		initializer: function()
		{
			total_players = 0
			for (var i in players_info)
			{
				if (players_info.hasOwnProperty(i))
				{
					total_players++
				}
			}


			this.setAnims(Y.one('#placement_message2'))

			

			colorpicker_panel = this.colorpicker_panel = Y.one('#dialog')
			colorpicker_panel.setHTML(this.buildColorPicker())
			colorpicker_panel.hide();
			selectedColor=''

			colorpicker_panel2 = this.colorpicker_panel2 = Y.one('#dialog2')
			colorpicker_panel2.setHTML(this.buildColorPicker2())
			colorpicker_panel2.hide();
			selectedColor2=''

			boardimage = this.boardimage = Y.Node.create('<img src="./images/back_game.png" style="position:absolute; z-index:0; left:109px; top:88px; width:1077px; height:'+(Y.one('#wrapper').get('offsetHeight')-360)+'px;"/>');
			Y.one('#wrapper').append(this.boardimage)

				this.setListeners()
			this.initCards(card_data);

			if (game.players.self.host)
				game.socket.send('c.gh.')
		},
		initCards:function(cards)
		{
			if (cardsinited) return

			this.minidecks = []
			cardsinited = 1
			var par = this
			var wr = Y.one('#wrapper')

			Y.Array.each(cards, function(c)
			{
				mastercards[c['id']] = {'number':c['number'],'type':c['type'] ,'color':c['color'], 'special_id':c['special_id']}
				var card = new Y.Card({id:c['id'],x:0,y:0,width:cardwidth,number:c['number'],type:c['type'],color:c['color'],special_id:c['special_id'],inDeck:1});
				var cardview = new Y.CardView({model:card});
				cardviews[c['id']] = cardview
				cardview.get('container').setStyle('display','none')
				cardview.get('container').setAttribute('id',c['id'])
				wr.append(cardview.get('container'));
			});

			deckm = new Y.Deck({x:deckX,y:deckY})
			deck=new Y.DeckView({model:deckm})
			Y.one('#wrapper').append(deck.get('container'))
			deck.render()

			gridview = new Y.CardGridView({model:new Y.CardGrid({width:Y.one('#wrapper').get('offsetWidth'),division:40,numberOfCards:0,y:handY})});
			Y.one('#wrapper').append(gridview.get('container'));
			gridview.render()


			trashm = new Y.Trash({x:trashX,y:trashY})
			trash=new Y.TrashView({model:trashm})
			Y.one('#wrapper').append(trash.get('container'))
			trash.render()

			order = 0;
			var numberCards = {}
			var mv = null
			var ind = 1
			var dm = null

			for (var i = 1 ; i < (total_players+1) ; i++)
			{
				if (playerOrder[i]==game.players.self.id) {  ind=i }
			}

			var next = ind+1;
			if (next>=(total_players+1)) next = 1
			var count = 1
			var found =0

			while (playerOrder[next]!=game.players.self.id && !found)
			{
				if (next>=(total_players+1)) next = 1;

				if (playerOrder[next]==game.players.self.id)
				{
					break;
				}
				if (count==1 && total_players!=2)
				{
						dm = new Y.MiniDeck({rotation:90,player_id:playerOrder[next],x:10,y:170,height:Y.one('#wrapper').get('offsetHeight'),division:50,numberOfCards:0,istoright:0});
						mv = new Y.MiniDeckView({model:dm})
						this.minidecks.push(mv);
						mv.render();
						this.get('container').append(mv.get('container'))
				}
				else if (count==2 || total_players==2)
				{
					dm = new Y.MiniDeck({rotation:180,player_id:playerOrder[next],x:20,y:35,width:Y.one('#wrapper').get('offsetWidth'),division:50,numberOfCards:0,istoright:0});
					mv = new Y.MiniDeckView({model:dm})
					this.minidecks.push(mv);
					mv.render();
					this.get('container').append(mv.get('container'))
				}
				else if (count==3)
				{
					dm = new Y.MiniDeck({rotation:270,player_id:playerOrder[next],x:800,y:55,height:Y.one('#wrapper').get('offsetHeight'),division:50,numberOfCards:7,istoright:1});
					mv = new Y.MiniDeckView({model:dm})
					this.minidecks.push(mv);
					mv.render();
					this.get('container').append(mv.get('container'))
				}
				next++;
				count++;
				if (count>=(total_players+1)) found=1;
			}


			if (game.players.self.host)
			{
				game.socket.send('c.gxc.'+givexcardsfirst)   // give x cards
			}
		},
		playShuffle:function()
		{
			this.shuffle_audio.play();
		},
		playCardSound:function()
		{

			this.won_audio.play()
		},
		shoutUno:function(player_id)
		{
			
			var selectedMiniDeckNext2 = null;
			Y.Array.each(thisapp.get('activeView').minidecks,function(md)
			{
				var m = md.get('model')
				var miniplayer_id = m.get('player_id')
				if (miniplayer_id==player_id)
					selectedMiniDeckNext2 = md
			});
			
			var minig = 0
			if (selectedMiniDeckNext2!=null)
				minig = selectedMiniDeckNext2

			if (minig!=0)
			{
				
				var m = minig.get('model');
				var rot = m.get('rotation');
				var x =60
				var y = 105
				var image = 'images/bubble_l_t.png'
				if (rot==180)
				{
					image = 'images/bubble_t_t.png'
					x=660
					y=50
				}
				else if (rot==270)
				{
					image = 'images/bubble_r_t.png'
					x=978
					y=105
				}

				var n = Y.one('#UnoShout')
				n.set('src',image);
				n.setStyle('position','absolute');
				n.setStyle('display','block');
				n.setStyle('left',x)
				n.setStyle('top',y)
				n.setStyle('zIndex',900)

				var unoAnim = new Y.Anim({
					node: n,
					from: { opacity: 0 },
					to: { opacity: 1 },
					duration : 0.3
				});


				unoAnim.on('end', function(e)
				{
					var temp = new Y.Anim({
						node: n,
						from: { opacity: 1 },
						to: { opacity: 1 },
						duration : 2
					});
					temp.run();
					temp.on('end', function(e)
					{
						var temp2 = new Y.Anim({
							node: n,
							from: { opacity: 1 },
							to: { opacity: 0 },
							duration : 0.3
						});
						temp2.on('end', function(e)
						{
							n.setStyle('display','none');
						})
						temp2.run()

					});

				});
			}
			else
			{
				
				var n =  Y.one('#UnoShout')
				n.set('src','images/bubble_l_t.png');
				n.setStyle('position','absolute');
				n.setStyle('display','block');
				n.setStyle('left',580)
				n.setStyle('top',handY-130)
				n.setStyle('zIndex',900)

				var unoAnim = new Y.Anim({
					node: n,
					from: { opacity: 0 },
					to: { opacity: 1 },
					duration : 0.3
				});

				unoAnim.on('end', function(e)
				{
					var temp = new Y.Anim({
						node: n,
						from: { opacity: 1 },
						to: { opacity: 1 },
						duration : 2
					});
					temp.run();
					temp.on('end', function(e)
					{
						var temp2 = new Y.Anim({
							node: n,
							from: { opacity: 1 },
							to: { opacity: 0 },
							duration : 0.3
						});
						temp2.on('end', function(e)
						{
							n.setStyle('display','none');
						})
						temp2.run()
					});
					
				});


			}

			parrapp.playAudio(GAME_NAME,'uno')
			
			this.get('container').append(n);
			unoAnim.run();
			this.render();
		},
		buildColorPicker:function()
		{
			var master = Y.Node.create('<div id="colorpicker_content">')

			var toppanel = Y.Node.create('<div id="cp_toppanel">')
			toppanel.append('<div align=center id="cp_message">Choisis la couleur!</div>')

			var bottompanel = Y.Node.create('<div id="cp_bottompanel">')
			divblue = Y.Node.create('<div id="cp_blue"></div>')
			divyellow = Y.Node.create('<div id="cp_yellow"></div>')
			divgreen = Y.Node.create('<div id="cp_green"></div>')
			divred = Y.Node.create('<div id="cp_red"></div>')
			bottompanel.append(divblue)
			bottompanel.append(divyellow)
			bottompanel.append(divgreen)
			bottompanel.append(divred)
			divblue.on('click',function(e){ alert('bouhouhou'); });

			master.append(toppanel)
			master.append(bottompanel)
			return master.getHTML()
		},
		buildColorPicker2:function()
		{
			var master = Y.Node.create('<div id="colorpicker_content2">')

			var toppanel = Y.Node.create('<div id="cp_toppanel2">')
			toppanel.append('<div align=center id="cp_message2">Choisis la couleur!</div>')

			var bottompanel = Y.Node.create('<div id="cp_bottompanel2">')
			divblue = Y.Node.create('<div id="cp_blue2"></div>')
			divyellow = Y.Node.create('<div id="cp_yellow2"></div>')
			divgreen = Y.Node.create('<div id="cp_green2"></div>')
			divred = Y.Node.create('<div id="cp_red2"></div>')
			bottompanel.append(divblue)
			bottompanel.append(divyellow)
			bottompanel.append(divgreen)
			bottompanel.append(divred)
			divblue.on('click',function(e){ alert('bouhouhou'); });

			master.append(toppanel)
			master.append(bottompanel)
			return master.getHTML()
		},
		playOnTrash:function(player_played,card_played)
		{
			var selectedMiniDeck = null;
			Y.Array.each(this.minidecks,function(md)
			{
				var m = md.get('model')
				var player_id = m.get('player_id')
				if (player_id==player_played)
				{
					selectedMiniDeck = md
				}

			});

			selectedMiniDeck.putCardOnTrash(card_played);
			Y.one('#colorCard').hide()

		},
		playOnTrashColor:function(tot)
		{
			var color = tot['currentColorId']	
			var cardid = tot['pickedcard']
			var player_played = tot['pickedplayer']
			var currentCol = tot['currentColorId']	
			selectedColorId=currentCol
			
		
			topCardTrash = cardid
			
			if (player_played!=game.players.self.id)
			{
				var selectedMiniDeck = null;
				Y.Array.each(this.minidecks,function(md)
				{
					var m = md.get('model')
					var player_id = m.get('player_id')
					if (player_id==player_played)
					{
						selectedMiniDeck = md
					}
	
				});
	
				selectedMiniDeck.putCardOnTrashColor(cardid,color);
				
			}


			
		},
		playDrawTwoAndLoseTurn : function(tot)
		{
			var picktwoId = tot['picktwoId']
			var pick1 = tot['pick1']
			var pick2 = tot['pick2']

			if (picktwoId==game.players.self.id)
			{
				deck.giveCardToPlayerNoSend(pick1)
				deck.giveCardToPlayerNoSend(pick2)
			}
		},
		playDrawFourAndLoseTurn : function(tot)
		{
			var color = tot['currentColorId']	
			var cardid = tot['pickedcard']
			var player_played = tot['pickedplayer']
			var currentCol = tot['currentColorId']	
			var pickfourId = tot['pickfourId']
			var pick1 = tot['pick1']
			var pick2 = tot['pick2']
			var pick3 = tot['pick3']
			var pick4 = tot['pick4']

			Y.log('PICKED:'+[pick1,pick2,pick3,pick4].toSource())
			if (pickfourId!=game.players.self.id)
				namep = players_info[pickfourId]['login_name']+' pige quatre cartes et perd son tour!';
			else
				namep = 'Tu piges quatre cartes et perds ton tour!'
					
			this.say(namep)

			if (pickfourId==game.players.self.id)
			{
				//thisapp.get('activeView').giveSevenCards([pick1,pick2,pick3,pick4])
				//deck.giveXCardsToPlayer([pick1,pick2,pick3,pick4])
				deck.giveCardToPlayerNoSend(pick1)
				deck.giveCardToPlayerNoSend(pick2)
				deck.giveCardToPlayerNoSend(pick3)
				deck.giveCardToPlayerNoSend(pick4)
			}
			/*else
			{
				//selectedMiniDeck.giveXCardsToPlayer([pick1,pick2,pick3,pick4])
				Y.log('adding '+pick1+' to '+pickfourId)
				this.addCardFromDeck(pick1,pickfourId)
				Y.log('adding '+pick2+' to '+pickfourId)
				this.addCardFromDeck(pick2,pickfourId)
				Y.log('adding '+pick3+' to '+pickfourId)
				this.addCardFromDeck(pick3,pickfourId)
				Y.log('adding '+pick4+' to '+pickfourId)
				this.addCardFromDeck(pick4,pickfourId)
				//selectedMiniDeckNext2.giveFourCardsOpponent()
			}*/
			if (player_played!=game.players.self.id)
				this.playOnTrashColor(tot)
			else
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
				selectedColor=color				
			}
		},
		addCardFromDeck : function(card_played,player_played)
		{
			var cardview = cardviews[card_played]


			var selectedMiniDeck = null;

			Y.Array.each(thisapp.get('activeView').minidecks,function(md)
			{
				var m = md.get('model')
				var player_id = m.get('player_id')
				if (player_id==player_played)
				{
					selectedMiniDeck = md
				}

			});
			Y.log('FROM thisapp '+cardview.get('model').get('id'))
			selectedMiniDeck.addCardFromDeck(cardview);

		},
		addCardFromTrash : function(card_played,player_played)
		{
			var selectedMiniDeck = null;
			var cardview = cardviews[card_played]
			Y.Array.each(thisapp.get('activeView').minidecks,function(md)
			{
				var m = md.get('model')
				var player_id = m.get('player_id')
				if (player_id==player_played)
				{
					selectedMiniDeck = md
				}
			});

			selectedMiniDeck.addCardFromTrash(cardview);
		},
		sendEndGame:function()
		{
			thisapp.get('activeView').reinit()
			game.socket.send('c.eg.')
		},
		stopGame:function()
		{
			this.backimg.setStyles({ display:'none'} )
			parrapp.stopSounds()
			if (checkothermovesTO)
				clearInterval(checkothermovesTO)

			if (cardviews)
			{
				for (var i in cardviews)
				{
					if (cardviews.hasOwnProperty(i))
					{
						cardviews[i].get('container').setStyle('display','none')
					}
				}
			}

			if (deck)
			{
				deck.get('container').empty()
			}
			game.socket.send('c.eg.')
		},
		processMoveOpponent:function()
		{
			if (is_in_anim_op) return;
			if (blocksqueue.getLength()>0)
			{
				var newdata = blocksqueue.dequeue()
				this.doProcessMoveOpponent(newdata)
			}
		},
		doProcessMoveOpponent:function(newdata)
		{


		},
		say: function(msg)
		{
			//Y.log('say:'+msg)
			var t = this.message_top;
			t.setStyle('opacity',0);
			t.setStyle('display','block');
			t.setHTML(msg);
			this.message_top_anim.run();
		},
		highlightName : function(pid)
		{
			var selectedMiniDeck = null;
			var rejected = []
			Y.Array.each(thisapp.get('activeView').minidecks,function(md)
			{
				var m = md.get('model')
				var player_id = m.get('player_id')
				if (player_id==pid)
				{
					selectedMiniDeck = md
				}
				else
					rejected.push(md)
			});

			if (selectedMiniDeck!=undefined)
			{
				selectedMiniDeck.highlightName();
			}
			for (var i = 0 ; i < rejected.length ; i++)
			{
				rejected[i].resetHighlightName();
			}
			
		},
		playWinGame:function()
		{
			Y.one('#placement_message').setStyle('display','none');
			setTimeout('parent.main_instance.socket.send(\'c.eg.\'); ',winlose_anim_delay*1000)

			parrframe.main_instance.reconnected = true;
		},
		playLoseGame:function()
		{
			Y.one('#placement_message').setStyle('display','none');
			setTimeout('parent.main_instance.socket.send(\'c.eg.\'); ',winlose_anim_delay*1000)

			parrframe.main_instance.reconnected = true;
		},
		displayCurrentColorBlock:function()
		{
			var c = Y.one('#colorCard')
			c.setStyle('position','absolute')
			c.setStyle('left',trashX-10)
			c.setStyle('top',trashY-10)
			c.setStyle('width',colorselectedblockwidth)
			c.setStyle('height',colorselectedblockheight)
			
			var color = selectedColor
			
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
			selectedColor=color
		},
		setListeners : function()
		{
			//TODO 
			var par = this
			Y.one('#cp_blue').on('click',function(e)
					{
							colorpicker_panel.hide();
							selectedColor='blue'
							var tot = {}
							tot['color'] = selectedColor
							tot['card'] = pickedCard
							par.displayCurrentColorBlock()
							game.socket.send('c.pc.'+JSON.stringify(tot))  // pick color
							//dispatcher.sendEvent(3,{"color":"blue","card":pickedCard});
					});
					Y.one('#cp_yellow').on('click',function(e)
					{
							colorpicker_panel.hide();
							selectedColor='yellow'
							var tot = {}
							tot['color'] = selectedColor
							tot['card'] = pickedCard
							par.displayCurrentColorBlock()
							game.socket.send('c.pc.'+JSON.stringify(tot))  // pick color
							//dispatcher.sendEvent(3,{"color":"yellow","card":pickedCard});
					});
					Y.one('#cp_green').on('click',function(e)
					{
						
							colorpicker_panel.hide();
							selectedColor='green'
							var tot = {}
							tot['color'] = selectedColor
							tot['card'] = pickedCard
							par.displayCurrentColorBlock()
							game.socket.send('c.pc.'+JSON.stringify(tot))  // pick color
							//dispatcher.sendEvent(3,{"color":"green","card":pickedCard});
					});
					Y.one('#cp_red').on('click',function(e)
					{
							colorpicker_panel.hide();
							selectedColor='red'
							var tot = {}
							tot['color'] = selectedColor
							tot['card'] = pickedCard
							par.displayCurrentColorBlock()
							game.socket.send('c.pc.'+JSON.stringify(tot))  // pick color
							//dispatcher.sendEvent(3,{"color":"red","card":pickedCard});
					});


					Y.one('#cp_blue2').on('click',function(e)
					{
							colorpicker_panel2.hide();
							selectedColor='blue'
							var tot = {}
							tot['color'] = selectedColor
							tot['card'] = pickedCard
							par.displayCurrentColorBlock()
							game.socket.send('c.pc2.'+JSON.stringify(tot))   // pick color
							//dispatcher.sendEvent(4,{"color":"blue","card":pickedCard});
					});
					Y.one('#cp_yellow2').on('click',function(e)
					{
							colorpicker_panel2.hide();
							selectedColor='yellow'
							var tot = {}
							tot['color'] = selectedColor
							tot['card'] = pickedCard
							par.displayCurrentColorBlock()
							game.socket.send('c.pc2.'+JSON.stringify(tot))  // pick color
							//dispatcher.sendEvent(4,{"color":"yellow","card":pickedCard});
					});
					Y.one('#cp_green2').on('click',function(e)
					{
							colorpicker_panel2.hide();
							selectedColor='green'
							var tot = {}
							tot['color'] = selectedColor
							tot['card'] = pickedCard
							par.displayCurrentColorBlock()
							game.socket.send('c.pc2.'+JSON.stringify(tot))  // pick color
							//dispatcher.sendEvent(4,{"color":"green","card":pickedCard});
					});
					Y.one('#cp_red2').on('click',function(e)
					{
							colorpicker_panel2.hide();
							selectedColor='red'
							var tot = {}
							tot['color'] = selectedColor
							tot['card'] = pickedCard
							par.displayCurrentColorBlock()
							game.socket.send('c.pc2.'+JSON.stringify(tot))   // pick color
							//dispatcher.sendEvent(4,{"color":"red","card":pickedCard});
					});			
		},
		setAnims : function(div)
		{
			this.message_top = div

			var node = this.message_top
			par = this

			this.message_top_anim = new Y.Anim({
					node: node,
					from: { opacity: 0 },
					to: { opacity: 1 },
					duration : top_anim_duration_fadein
				});
			this.message_top_anim.on('end',function(e)
			{
				var aa = new Y.Anim({
					node: node,
					from: { opacity: 1 },
					to: { opacity: 1 },
					duration : top_anim_duration_sustain
				});
				aa.run()
				aa.on('end',function(e)
				{
					if (par.message_top!=undefined)
						par.message_top.setStyle('display','none')
				});
			});


			this.message_top_flash = new Y.Anim({
				node: node,
				from: {
					fontSize:node.getStyle('fontSize'),
					borderColor: node.getStyle('borderTopColor')
				},

				to: {
					borderColor: '#BA6200',
					fontSize:'32px'
				},

				duration:1.2
			});
			this.message_top_flash.on('end',function(e)
			{
				if (par.cancelFlash==1)
				{
					if (this.get('reverse'))
					{
						par.message_top.setStyle('fontSize','21px');
						return;
					}
				}
				if (this.get('reverse'))
				{
					this.set('reverse',false);
					this.run();
				}
				else
				{
					this.set('reverse',true);
					this.run();
				}
			});


		},
		render: function()
		{
			return this;
		},
		ATTRS:
		{
			grids1 : { value : null },

		}
	});

	Y.ScoreShower = new Y.Base.create('scoreshower',Y.Model,[],
	{
		ATTRS:
		{
			players: { value:{} }
		}
	});

	Y.GameFinish = Y.Base.create('gamefinish',Y.View,[],
	{
		container: '<div>',
		initializer: function()
		{
			myturn = 0;
			currentTurn = ''
			otherplayermodels = {}
			hands = {}
			hand = []
			inboard = false
			first_turn_notice = false
			is_in_anim = 0;
			is_swap = false
			cardsinited = false;
			gamerestart = 1
			olddragzindex = 0
			oldZIndex = 0
			temp_hand = []
			old_current_cell = -1
			playerOrder = null
			canplaceOnTrash = false
			trashorder = 0
			currentTurn=0
			
			deckview = null;
			trash = null;
			trashview = null;
			xdrag = 0;
			ydrag = 0;
			mastercards = {}
			topCardTrash = 0
			colorpicker_panel = null;
			colorpicker_panel2 = null;
			divblue = null
			divyellow = null
			divgreen = null
			divred = null
			selectedColor = ''
			stfu = false;
			selectedColorId = 0
			pickedCard = 0
			totalCardsInDeck = 0;
			won = false;
			total_players = 0
			unoAlreadyShouted = false

			Y.one('#colorCard').setStyle('display','none');
			Y.one('#placement_message2').setStyle('display','none');
			Y.one('#dialog').setStyle('display','none');
			Y.one('#dialog2').setStyle('display','none');
			Y.one('#cp_green').setStyle('display','none');
			Y.one('#cp_green2').setStyle('display','none');
			Y.one('#cp_red').setStyle('display','none');
			Y.one('#cp_red2').setStyle('display','none');
			Y.one('#cp_yellow').setStyle('display','none');
			Y.one('#cp_yellow2').setStyle('display','none');	
			Y.one('#cp_blue').setStyle('display','none');
			Y.one('#cp_blue2').setStyle('display','none');
			boardimage.setStyle('display','none');
			
			for (var i in cardviews)
			{
				if (cardviews.hasOwnProperty(i))
				{
					cardviews[i].get('container').setStyle('display','none')
				}
			}
			
			deck.get('container').empty()
			
			parrapp.playAudio(GAME_NAME,'fanfare')

			var namediv = Y.Node.create('<div align=center style="z-index:80; position:absolute; left:375px; top:360px; font-size:64px; font-weight:bold;"></div>')
			namediv.setHTML('Bravo '+winner_name+'!');
			//this.get('container').append(namediv)
			n = Y.Node.create('<div id="end_message" align=center></div>')
			n.setHTML('Bravo '+winner_name+'!')

			anim = new Y.Anim({
				node: n,
				from: { opacity: 0 },
				to: { opacity: 1 },
				duration : 3
			});

			n.setStyle('opacity',0);
			n.setStyle('display','block');
			this.get('container').append(n)
			anim.run();
			
			setTimeout('parent.main_instance.socket.send(\'c.eg.\'); ',9000)
		},
		render : function()
		{
			return this;
		}

	});

	////////////////////////////////////////////////////////////////////////////////////////////////////

	var gameapp = function()
	{

		thisapp = new Y.App({
			views: {
				 home   : {type: 'Home'},
				 login   : {type: 'Login'},
				game : {type: 'Game'},
				gamefinish   : {type: 'GameFinish'}
			},
			viewContainer: '#wrapper',
			serverRouting : false,
		});


		thisapp.route('/', function () {

				if (!parrframe.main_instance.reconnected)
					parrframe.main_instance.socket.send('c.cfg.'+parrframe.main_instance.activeGame+'|||'+GAME_NAME);
				else
				{
					if (checkothermovesTO)
						clearInterval(checkothermovesTO)
					thisapp.showView('home');
					return;
				}

				var f = function (data){

					var aa = data.split('|||');
					var accepted = parseInt(aa[0]);
					var ishost = aa[1];

					if (accepted || parrframe.main_instance.debug)
					{

						parrframe.main_instance.reconnected = false;
						if (parrframe.main_instance.hosting)
							game.players.self.host = true;

						if (parrframe.main_instance.debug)
							debug = true;
						if (checkothermovesTO)
							clearInterval(checkothermovesTO)
						thisapp.showView('home');
						parrframe.main_instance.activeGame='';

					}
					else
						parrframe.app.get('activeView').setGame('lobby');
				}
				if (parrframe.main_instance.activeGame==undefined || parrframe.main_instance.activeGame=='')
				{
					parrframe.main_instance.activeGame='';
					parrframe.app.get('activeView').setGame('lobby')
					return;
				}
				parrframe.main_instance.socket.removeAllListeners('confirm');
				parrframe.main_instance.socket.on('confirm', f);

				thisapp.showView('login');
		});

		thisapp.navigate('/');
	}
	GameApp = gameapp;

}, '1.0', {requires: ['chat','playerlist','gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});

