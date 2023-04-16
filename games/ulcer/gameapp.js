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
			//var thisplayer = this.thisplayer = new Y.Player({id:0,login_name:parrframe.main_instance.login_name});

			//playerlistview.playerlist.add(thisplayer);

			var chatview = this.chatview = new Y.ChatView();

			this.backimg = Y.Node.create('<div style="z-index:-1; position:absolute; left:0px; top:0px;"><img src="./images/bg2.jpg" style="width:1290; height:650px;"/></div>');
			Y.one('#wrapper').append(this.backimg);

			this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:'Bienvenue &agrave; Trouble!'}));
			if (game.players.self.host && !gamestarted)
				this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:'En attente d\'un adversaire'}));

			game.client_connect_to_server(parrframe.main_instance.login_name);

			if (parrframe.main_instance.hosting && parrframe.main_instance.reconnected)
			{
				game.socket.send('c.hl.')
				game.players.self.host=true
			}



			game.socket.send('c.l.'+parrframe.main_instance.login_name)
			game.players.self.login_name=parrframe.main_instance.login_name;
			this.homeheadview = new Y.HomeHeadView();
			if (parrframe.main_instance.hosting && parrframe.main_instance.reconnected)
			{
				game.socket.send('c.hl.')
				game.players.self.host=true
			}
			parrframe.main_instance.reconnected = false;
		},
		updatePlayerColor : function(pid,col)
		{
			players_info[pid]['color'] = col
			if (pid==game.players.self.id)
			{
				game.players.self.color = col
			}
			else
			{
				game.players.others[pid].color = col
			}
			this.playerlistview.changePlayerColor(pid,col)

		},
		addHostToPlayerList: function()
		{
			var thisplayer = this.thisplayer = new Y.Player({id:game.players.self.id,login_name:parrframe.main_instance.login_name, color:game.players.self.color});
			this.playerlistview.playerlist.add(thisplayer);

		},
		reinit:function()
		{

		},
		loginOtherPlayer: function(playerid)
		{
			var pl = game.players.others[playerid].login_name
			var prep = game.players.others[playerid].pre_played
			var pel = game.players.others[playerid].pre_elimine
			var gw = game.players.others[playerid].game_won
			var plcl = game.players.others[playerid].color

			if (!otherplayermodels[playerid] || otherplayermodels[playerid]==undefined)
			{
				otherplayermodels[playerid] = new Y.Player({id:playerid, login_name:pl, color:plcl});

				this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:game.players.others[playerid].login_name+' s\'est joint &agrave; la partie'}));
			}

			this.playerlistview.playerlist.add(otherplayermodels[playerid]);

			if (game.players.self.host || parrframe.main_instance.hosting)
				this.activateGoButton()

			players_info[playerid] = { login_name:pl , pre_played:prep , pre_elimine:pel , color:plcl, game_won:gw }
			game.socket.send('c.gpi.'+playerid)   // get player infos
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
			currentTurn = playerOrder[1]
			this.backimg.setStyle('display','none');
			gamestarted = true;
			thisapp.showView('game');
		},
		checkColors: function()
		{
			var checkedp = [];
			var ok = true;
			for (var i in players_info)
			{
				if (players_info.hasOwnProperty(i))
				{
					if (!inArray(players_info[i]['color'],checkedp))
					{
						checkedp.push(players_info[i]['color']);
					}
					else
						ok = false;
				}

			}
			return ok;
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
			buttonDiv.one('#startbutton').on('mousedown',function(e)
			{
				if (!par.checkColors())
				{
					alert('Des joueurs ont la meme couleur!')
					e.preventDefault();
					return;
				}
				game.socket.send('c.sg.');
			});
			buttonDiv.one('#startbutton').on('touchstart',function(e)
			{
				if (!par.checkColors())
				{
					alert('Des joueurs ont la meme couleur!')
					e.preventDefault();
					return;
				}
				game.socket.send('c.sg.');
			});
			leftpanel.append(buttonDiv);

			var bottompanel = Y.Node.create('<div class="placement_bottompanel_home"></div>');
			bottompanel.append(this.chatview.render().get('container'));

			submaster.append(leftpanel);
			submaster.append(bottompanel);
			masterdiv.append(submaster)

			this.get('container').append(masterdiv)

			if (game.players.self.host)
			{
				colorchooser = new Y.ColorChooserView();
				colorchooser.get('container').setStyles({left:100,top:100,position:'absolute',display:'none'})
				this.get('container').append(colorchooser.get('container'));
			}
		}
	});

	Y.Game = Y.Base.create('game',Y.View,[],
	{
		grids1:null,
		grids2:null,
		minigrid:null,
		started:false,
		message_top_anim:null,
		turnshowview:null,
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

			this.message_top = message_top = Y.one('#placement_message2')
			this.message_top.setStyle('display','none')

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

			var c = this.get('container');

			//this.backimg = Y.Node.create('<div style="z-index=1; position:absolute; left:0px; top:0px;"><img src="./images/back_hand.jpg" style="width:1290; height:900px;"/></div>');

			var leftpanel = Y.Node.create('<div class="placement_leftpanel_game"></div>');
			var tsv = this.turnshowview = new Y.TurnshowView();
			leftpanel.append(tsv.get('container'))
			var boardpanel = Y.Node.create('<div id="placement_rightpanel" class="placement_rightpanel_game"></div>');

			boardview = new Y.BoardView();
			var bv = boardview.get('container');
			bv.setStyle('width','439');
			bv.setStyle('height','434');

			boardpanel.append(bv);
			c.append(leftpanel);
			c.append(boardpanel);

			pionsqueue = new Queue();

			//TODO
			game.socket.send('c.stm.') // show start message

			//dispatcher.sendEvent(1,0)
			/////////////////////////

			/*var bluepion0 = pionsMap[28]
			var bluepion1 = pionsMap[29]
			var bluepion2 = pionsMap[30]
			var bluepion3 = pionsMap[31]

			var yellowpion0 = pionsMap[32]
			var yellowpion1 = pionsMap[33]
			var yellowpion2 = pionsMap[34]
			var yellowpion3 = pionsMap[35]

			boardview.movePionToCell(bluepion0.get('model').get('id') , 45,0);
			boardview.movePionToCell(bluepion1.get('model').get('id') , 46,0);
			boardview.movePionToCell(bluepion2.get('model').get('id') , 47,0);
			boardview.movePionToCell(bluepion3.get('model').get('id') , 25,0);


			boardview.movePionToCell(yellowpion0.get('model').get('id') , 49,0);
			boardview.movePionToCell(yellowpion1.get('model').get('id') , 50,0);
			boardview.movePionToCell(yellowpion2.get('model').get('id') , 51,0);
			boardview.movePionToCell(yellowpion3.get('model').get('id') , 4,0);*/


		},
		sendEndGame:function()
		{
			thisapp.get('activeView').reinit()
			game.socket.send('c.eg.')
		},
		stopGame:function()
		{
			//this.backimg.setStyles({ display:'none'} )
			parrapp.stopSounds()
			if (checkothermovesTO)
				clearInterval(checkothermovesTO)

			game.socket.send('c.eg.')
		},
		processMoveOpponent:function()
		{
			if (is_in_anim) return;
			if (pionsqueue.getLength()>0)
			{

				var newpionmove = JSON.parse(pionsqueue.dequeue())
				is_in_anim = true
				boardview.moveAnim(newpionmove)
			}
		},
		say: function(msg)
		{
			//Y.log('say:'+msg)
			var t = message_top;
			t.setStyle('opacity',1);
			t.setStyle('display','block');
			t.setHTML(msg);
			setTimeout('message_top.setStyle(\'display\',\'none\'); ',1500)
			//this.message_top_anim.run();
		},
		showTurn : function()
		{

			if (currentTurn==game.players.self.id)
			{
				myturn = true
				if (is_pre)
					thisapp.get('activeView').say('C\'est ton tour')
				possible_moves = {}
				popitblock=false
				boardview.popperview.updateCursor()
			}
			else
			{
				myturn = false
				if (is_pre)
					thisapp.get('activeView').say('C\'est au tour de '+players_info[currentTurn]['login_name'])
				popitblock = true;

			}

			thisapp.get('activeView').turnshowview.render();
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

