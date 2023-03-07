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

			this.backimg = Y.Node.create('<div style="z-index:-1; position:absolute; left:0px; top:0px;"><img src="./images/bg2.jpg" style="width:1290; height:650px;"/></div>');
			Y.one('#wrapper').append(this.backimg);

			this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:'Bienvenue &agrave; Rummy!'}));
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
			gamestarted = false
			currentTurn = ''
			//players_info = {}
			otherplayermodels = {}
			myturn = false
			first_turn_notice = false
			Y.one('#placement_message2').setStyle('display','none');
			is_in_anim = false;
			if (boardimage)
				boardimage.setStyle('display','none')
			currentTurn = ''
			hands = {}
			hand = []
			topDeckCard=0
			totalCardsInDeck=0
			inboard = false
			olddragzindex = 0
			oldZIndex = 0
			temp_hand = []
			old_current_cell = -1
			is_swap = false
			cardsinited = false;
			turnstep = 0
			trashorder = 0
			canplaceOnTrash = false
			xdrag=0
			ydrag=0
			mastercards = {}
			latestTrashOrder = 0
			latestHandOrder = 0
			playerOrder = null
			trash=0
			deck = 0
			total_players = 0
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

			this.message_top = Y.one('#placement_message2')
			this.message_top.setStyle('display','none')

			boardimage = this.boardimage = Y.Node.create('<img src="./images/board.jpg" style="border:groove 3px #9f9f9f;  position:absolute; z-index:1; left:109px; top:110px; width:1077px; height:'+(Y.one('#wrapper').get('offsetHeight')-360)+'px;"/>');
			Y.one('#wrapper').append(this.boardimage)
			
			var inhandpointerregion = Y.Node.create('<div id="inhandpointerregion">')
			Y.one('#wrapper').append(inhandpointerregion)
			
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

			Y.one('#group_area').setStyle('display','block');

			var c = this.get('container');

			c.setStyle('backgroundColor','#23423e')

			this.backimg = Y.Node.create('<div style="z-index=1; position:absolute; left:0px; top:0px;"><img src="./images/back_hand.jpg" style="width:1290; height:900px;"/></div>');
			Y.one('#wrapper').append(this.backimg);

			var c = this.get('container');

			var boardpanel = Y.Node.create('<div id="placement_rightpanel" class="placement_rightpanel_game"></div>');

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
				mastercards[c['id']] = {'number':c['number'],'type':c['type']}
				var card = new Y.Card({id:c['id'],x:0,y:0,width:cardwidth,number:c['number'],type:c['type'],inDeck:1});
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

			gridview = new Y.CardGridView({model:new Y.CardGrid({width:Y.one('#wrapper').get('offsetWidth'),division:40,numberOfCards:0,y:680})});
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

			var node = Y.one('#group_area')
			var groupboard = new Y.GroupBoard({x:node.getXY()[0], y:node.getXY()[1], width:node.getStyle('width'), height:node.getStyle('height'),groups:[]})
			groupboardview = new Y.GroupBoardView({model:groupboard})
			/*var t = groupboardview.addGroup(24,0)
			//groupboardview.addCardsToGroup(t,[1,2,3,4,5])
			groupboardview.addGroup(16,0)
			groupboardview.addGroup(23,0)
			var ttt = groupboardview.addGroup(43,0)
			groupboardview.addGroup(14,0)
			groupboardview.addCardsToGroup(ttt.get('model').get('id'),[8,9,10,11,12])
			var tt=groupboardview.addGroup(22,0)
			groupboardview.addGroup(50,0)
			groupboardview.addGroup(42,0)
			groupboardview.addGroup(19,0)
			groupboardview.addGroup(17,0)
			//groupboardview.addCardsToGroup(ttt.get('model').get('id'),[1,2,3,4,5,6,7])*/

			if (game.players.self.host)
			{
				game.socket.send('c.gxc.'+givexcardsfirst)   // give x cards
			}
		},
		createGroup:function(card_data, pid)
		{
			var selectedMiniDeck = null;
			Y.Array.each(thisapp.get('activeView').minidecks,function(md)
			{
				var m = md.get('model')
				var player_id = m.get('player_id')
				if (player_id==pid)
				{
					selectedMiniDeck = md
				}

			});
			selectedMiniDeck.get('model').set('numberOfCards',selectedMiniDeck.get('model').get('numberOfCards')-1)
			selectedMiniDeck.addGroupAnimate(card_data[0],card_data[1])  // card id to add, name of the group
			selectedMiniDeck.render()
		},
		addCardToGroup:function(card_data, pid)
		{
			var selectedMiniDeck = null;
			Y.Array.each(thisapp.get('activeView').minidecks,function(md)
			{
				var m = md.get('model')
				var player_id = m.get('player_id')
				if (player_id==pid)
				{
					selectedMiniDeck = md
				}

			});
			selectedMiniDeck.get('model').set('numberOfCards',selectedMiniDeck.get('model').get('numberOfCards')-1)
			selectedMiniDeck.addCardToGroupAnimate(card_data[0],card_data[1])  // card id to add, name of the group
			selectedMiniDeck.render()
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
		initializer: function()
		{
			for (var i in cardviews)
			{
				if (cardviews.hasOwnProperty(i))
				{
					var c = cardviews[i].get('container');
					c.setStyle('display','none')
				}
			}
			deck.get('container').empty()

			var name = players_info[playerwon]['login_name']
			var str = 'Bravo '+name+'!'

			var c = this.get('container')

			Y.one('#wrapper').append(Y.Node.create('<div align=center id="congratulationMsg">'+str+'</div>'))
			var total = this.calcResults()
			Y.one('#wrapper').append(Y.Node.create('<div align=center id="totalMsg">Total: +'+total+' points!</div>'))

			if (game.players.self.id==playerwon)
				game.socket.send('c.usc.'+total)
			this.reinit()

			setTimeout('parent.main_instance.socket.send(\'c.eg.\');',8000);
		},
		reinit:function()
		{
			gamestarted = false
			currentTurn = ''
			otherplayermodels = {}
			hands = {}
			hand = []
			topDeckCard=0
			totalCardsInDeck=0
			currentTurn = 0
			myturn = false
			first_turn_notice = false
			Y.one('#placement_message2').setStyle('display','none')
			is_in_anim = false
			inboard = false
			olddragzindex = 0
			oldZIndex = 0
			temp_hand = []
			old_current_cell = -1
			is_swap = false
			cardsinited = false;
			turnstep = 0
			trashorder = 0
			canplaceOnTrash = false
			xdrag=0
			ydrag=0
			mastercards = {}
			latestTrashOrder = 0
			latestHandOrder = 0
			playerOrder = null
			trash = 0
			deck = 0
			total_players = 0
		},
		calcResults:function()
		{
			var tot = ''
			var count = 0
			var n = Y.Node.create('<div align=center>')
			var posx = 150
			var posy = 180
			var total = 0
			for (var i in hands)
			{
				if (hands.hasOwnProperty(i))
				{
					if (i!=playerwon)
					{
						var h = hands[i]
						for (var j = 0 ; j < h.length ; j++)
						{
							var card = cardviews[h[j]]
							var cc = card.get('container')
							cc.setStyle('display','block')
							card.image.set('width',cardwidth)
							card.image.set('zIndex',1400)
							this.rotateImage(card.image,0)
							card.image.set('src','./images/cards/'+h[j]+'.png')
							card.image.setStyle('width',cardwidth-10)
							cc.setStyle('left',posx)
							cc.setStyle('top',posy)
							cc.setStyle('position','absolute')
							var newn = Y.Node.create('<div align=center style="z-index:1400">')
							newn.setStyle('left',posx+10)
							newn.setStyle('top',posy-51)
							newn.setStyle('position','absolute')
							newn.setStyle('fontSize','25px')
							newn.setStyle('backgroundColor','#000')
							newn.setStyle('color','#aaaa00')
							newn.setStyle('border','solid 1px #999999')
							newn.setStyle('lineHeight','40px')
							newn.setStyles({width:'50px',height:'40px'})
							var points = 0
							var number = parseInt(card.get('model').get('number'))
							if (number >10) number = 10
							newn.setHTML('+'+number)
							total+=number
							Y.one('#wrapper').append(newn)
							posx+=125
						}
						posy+=180
						posx = 150
					}
				}
			}
			return total

		},
		rotateImage : function(imgs,degs)
		{
			imgs.setStyle('-ms-transform','rotate('+degs+'deg)');
			imgs.setStyle('-webkit-transform','rotate('+degs+'deg)');
			imgs.setStyle('transform','rotate('+degs+'deg)');
		},
		render: function()
		{
			return this
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

