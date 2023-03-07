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
			game.players.self.login_name=parrframe.main_instance.login_name

			var playerlistview = this.playerlistview = new Y.PlayerListView();
			var thisplayer = this.thisplayer = new Y.Player({id:game.players.self.id,login_name:game.players.self.login_name});
			playerlistview.playerlist.add(thisplayer);

			var chatview = this.chatview = new Y.ChatView();

			this.backimg = Y.Node.create('<div style="z-index:-1; position:absolute; left:0px; top:0px;"><img src="./images/back.png" style="width:1290; height:650px;"/></div>');
			//Y.one('#wrapper').append(this.backimg);

			this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:'Bienvenue &agrave; MasterMind!'}));
			if (game.players.self.host && !gamestarted)
				this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:'En attente d\'un adversaire'}));
			gamestarted = false

			game.client_connect_to_server(parrframe.main_instance.login_name);

			if (parrframe.main_instance.hosting)
			{
				game.players.self.host=true;
				game.players.other.host=false;
			}
			else
			{
				game.players.self.host=false;
				game.players.other.host=true;
			}
			if (parrframe.main_instance.hosting && parrframe.main_instance.reconnected)
			{
				game.socket.send('c.hl.')

			}
			if (parrframe.main_instance.reconnected)
			{
				this.reinit();
			}
			parrframe.main_instance.reconnected = false;
			game.socket.send('c.l.'+parrframe.main_instance.login_name)
			game.players.self.login_name=parrframe.main_instance.login_name;
			this.homeheadview = new Y.HomeHeadView();
			game.socket.send('c.gid.')   // get my id

			if (!game.players.self.host)
				game.socket.send('c.god.')   // get other id

			game.socket.send('c.gcm.')  // get current master
			this.reinit()
		},
		reinit:function()
		{
			//Y.log('reinit')
			gamestarted = false
			currentTurn = ''
			players_info = {}
			myturn = false
			Y.one('#placement_message').setStyle('display','none');
			is_in_anim = false;
			current_master = 0;
			masterstart_button_enable = false;
			playerstart_button_enable = false;
			colors_set = false;
			current_row = 9;
			current_row_str = '';
			trigger_current_row_dec = false;
			master_locked_in = false;
			current_hints_str = '';
			endgame = 0;
			solution = [];
			endgameshown = false;
		},
		loginOtherPlayer: function()
		{
			this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:game.players.other.login_name+' s\'est joint &agrave; la partie'}));
			var otherplayer = this.otherplayer = new Y.Player({login_name:game.players.other.login_name});

			this.playerlistview.playerlist.add(otherplayer);
			game.socket.send('c.sc.')
			if (game.players.self.host || parrframe.main_instance.hosting)
				this.activateGoButton()
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
		removeOtherPlayer: function()
		{
			game.socket.send('c.l.'+game.players.self.login_name)

			var oldln = game.players.other.login_name;
			game.players.other.login_name=''
			if (this.otherplayer)
			{
				this.playerlistview.playerlist.remove(this.otherplayer);
				this.playerlistview.render();
			}

			this.updateScore()
			this.deactivateGoButton()
			if (oldln!='')
				this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:oldln+' a quitt&eacute;... En attente d\'un autre adversaire'}));
			this.homeheadview.eraseOther();
			delete players_info[otherplayerid]

		},
		updateScore:function()
		{
			this.homeheadview.updateScore();
		},
		updateOpponentName:function(name)
		{
			var m = this.get('container').one('#otherplayername')
			if (m)
				m.setHTML(name+':')
		},
		startGame:function()
		{
			this.backimg.setStyle('display','none');
			gamestarted = true;
			thisapp.showView('game');
		},
		render: function()
		{
			var masterdiv = Y.Node.create('<div class="master_home"></div>')
			masterdiv.append(this.homeheadview.get('container'));

			var submaster  = Y.Node.create('<div class="sub_master"></div>')

			var leftpanel = Y.Node.create('<div class="placement_leftpanel"></div>');

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

			var bottompanel = Y.Node.create('<div class="placement_bottompanel"></div>');
			bottompanel.append(this.chatview.render().get('container'));

			submaster.append(leftpanel);
			submaster.append(bottompanel);
			masterdiv.append(submaster)
			this.get('container').append(masterdiv)
			this.get('container').append('<img src="./images/warm4.jpg" style="position:absolute; width:1290px; height:900px; z-index:-8; left:0px; top:0px;">');
		}
	});

	Y.Game = Y.Base.create('game',Y.View,[],
	{
		backimg:null,
		initializer: function()
		{
			initGrid = false

			this.message_top = Y.one('#placement_message')

			var node = this.message_top
			par = this

			this.message_top_anim = new Y.Anim({
					node: node,
					from: { opacity: 0 },
					to: { opacity: 1 },
					duration : 1
				});
			this.message_top_anim.on('end',function(e)
			{
				var aa = new Y.Anim({
					node: node,
					from: { opacity: 1 },
					to: { opacity: 1 },
					duration : 3
				});
				aa.run()
				aa.on('end',function(e)
				{
					if (par.message_top!=undefined)
						par.message_top.setStyle('display','none')
				});
			});


			var c = this.get('container');

			c.setStyle('backgroundColor','#23423e')

			this.backimg = Y.Node.create('<div style="z-index=1; position:absolute; left:0px; top:0px;"><img src="./images/back_game.jpg" style="width:1290; height:650px;"/></div>');
			//Y.one('#wrapper').append(this.backimg);

			var c = this.get('container');

			var boardpanel = Y.Node.create('<div id="placement_rightpanel" class="placement_rightpanel_game"></div>');
			//Y.log('current master:'+current_master)
			if (myplayerid==current_master)
			{
				boardview = new Y.BoardViewMaster();
				selectorview = new Y.SelectorViewMaster();
				masterstart_button = Y.Node.create('<div class="masterstart_button">GO</div>');
				masterstart_button.onclick = null
				masterstart_button.on('click', function(e)
				{
					if (!masterstart_button_enable) return

					game.socket.send('c.ss.'+Y.JSON.stringify(boardview.currentSelection))
					// TODO
					//dispatcher.sendEvent(1,boardview.currentSelection)
					masterstart_button.setStyle('display','none');
					var cm = Y.one('#cachette_master')

					cm.append('<img src="./images/cover_master_close.png">');

					master_locked_in = true
					thisapp.get('activeView').say('C\'est au tour de '+players_info[otherplayerid]['login_name'])

				});
				c.append(masterstart_button)
				c.append(selectorview.get('container'));
				boardpanel.append(boardview.get('container'));
				this.say('Entre le code de couleurs secret')

			}
			else
			{
				Y.one('#cachette_master').setStyle('display','none');
				boardviewplayer = new Y.BoardViewPlayer();
				selectorview = new Y.SelectorViewPlayer();
				c.append(selectorview.get('container'));
				Y.one('#placement_message').setStyle('display','block');
				Y.one('#placement_message').setHTML('<b>Un moment, l\'ennemi cr&eacute;e le code secret</b>');
				boardpanel.append(boardviewplayer.get('container'));

				playerstart_button = Y.Node.create('<div class="playerstart_button">GO</div>');
				playerstart_button.on('click', function(e)
				{
					//Y.log('click');
					if (!playerstart_button_enable) return
					playerstart_button_enable = false;
					//current_row--;

					boardviewplayer.totalSelected = 0;
					boardviewplayer.row_pieces = [];
					//Y.log('SEND 2: '+boardviewplayer.currentSelection.toSource());

					// TODO
					//dispatcher.sendEvent(2,boardviewplayer.currentSelection)
					game.socket.send('c.cs.'+Y.JSON.stringify(boardviewplayer.currentSelection))  // send and calculate solution attempt
					//Y.log(boardviewplayer.currentSelection.toSource());
					boardviewplayer.currentSelection = {};
					//dispatcher.sendEvent(1,boardview.currentSelection)
					playerstart_button.setStyle('cursor','default');
					playerstart_button.setStyle('backgroundColor','#774433');
					playerstart_button.setStyle('fontWeight','plain');
					playerstart_button.setStyle('color','#aaaaaa');
					playerstart_button_enable = false;

				});
				c.append(playerstart_button)

				//Y.one('#cachette').setHTML('? ? ?');
				Y.one('#cachette').append('<img src="images/cover.png"/>')
				Y.one('#cachette').setStyle('display','block');

			}

			//var bottompanel = Y.Node.create('<div id="placement_bottompanel" class="placement_bottompanel_game"></div>');
			//c.append(leftpanel);
			c.append(boardpanel);
			//c.append(bottompanel);



		},
		sendEndGame:function()
		{
			var n = Y.one('#winlose');
			n.setStyle('display','none');
			game.socket.send('c.eg.')
		},
		showTurn:function()
		{
			if (current_master==myplayerid)
			{
				var pm = Y.one('#placement_message');
				pm.setHTML('C\'est au tour de '+otherplayername);
				pm.setStyle('display','block');
			}
			else
			{
				var pm = Y.one('#placement_message');
				pm.setHTML('C\'est &agrave; ton tour');
				pm.setStyle('display','block');
				setTimeout('thisapp.get(\'activeView\').hidePlacementMessage()',3000)
			}

		},
		hidePlacementMessage:function()
		{
				var pm = Y.one('#placement_message');
				pm.setStyle('display','none');
		},
		sayNotMyTurn:function()
		{
			if (!endgameshown)
				this.say('C\'est au tour de '+players_info[otherplayerid]['login_name'])

		},
		stopGame:function()
		{
			this.backimg.setStyles({ display:'none'} )
			var tt = Y.one('#cachette')
			if (tt)
				tt.setStyle('display','none')
			tt = Y.one('#cachette_master')
			if (tt)
				tt.setStyle('display','none')
			tt = Y.one('#winlose')
			if (tt)
				tt.setStyle('display','none')
			tt = Y.one('#placement_message')
			if (tt)
				tt.setStyle('display','none')
			parrapp.stopSounds()
			if (checkothermovesTO)
				clearInterval(checkothermovesTO)
			thisapp.showView('home');
		},
		processMoveOpponent:function()
		{
			if (is_in_anim_op) return;
			if (blocksqueue.getLength()>0)
			{
				var newblocksmove = blocksqueue.dequeue()
				thisapp.get('activeView').moveOpponentBlocks(newblocksmove)
				if (!stopclickaudio)
					parrapp.playAudio(GAME_NAME,'click');
			}

		},
		say: function(msg)
		{
			var t = this.message_top;
			t.setStyle('opacity',0);
			t.setStyle('display','block');
			t.setHTML(msg);
			this.message_top_anim.run();

		},
		playWinGame:function()
		{
			Y.one('#placement_message').setStyle('display','none');
			setTimeout('parent.main_instance.socket.send(\'c.eg.\'); ',5000)

			//parrapp.playAudio(GAME_NAME,'win');

			parrframe.main_instance.reconnected = true;
		},
		playLoseGame:function()
		{
			Y.one('#placement_message').setStyle('display','none');
			setTimeout('parent.main_instance.socket.send(\'c.eg.\'); ',5000)

			//parrapp.playAudio(GAME_NAME,'lose');

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

	////////////////////////////////////////////////////////////////////////////////////////////////////

	var gameapp = function()
	{

		thisapp = new Y.App({
			views: {
				 home   : {type: 'Home'},
				 login   : {type: 'Login'},
				game : {type: 'Game'}
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

