YUI.add("gameapp", function(Y) {

	var console = new Y.Console();
	//console.render();

	var parr = parent;

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
			blockspos = {}
			spacepos = [400,400]
			currentSnap = {}
			game.players.self.login_name=parr.main_instance.login_name

			var playerlistview = this.playerlistview = new Y.PlayerListView();
			var thisplayer = this.thisplayer = new Y.Player({id:game.players.self.id,login_name:game.players.self.login_name});
			playerlistview.playerlist.add(thisplayer);

			var chatview = this.chatview = new Y.ChatView();

			this.backimg = Y.Node.create('<div style="z-index:-1; position:absolute; left:0px; top:0px;"><img src="./images/back.png" style="width:1290; height:650px;"/></div>');
			Y.one('#wrapper').append(this.backimg);

			this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:'Bienvenue &agrave; la Course Rubik!'}));
			if (game.players.self.host && !gamestarted)
				this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:'En attente d\'un adversaire'}));
			gamestarted = false

			game.client_connect_to_server(parr.main_instance.login_name);

			if (parr.main_instance.hosting)
			{
				game.players.self.host=true;
				game.players.other.host=false;
			}
			else
			{
				game.players.self.host=false;
				game.players.other.host=true;
			}
			if (parr.main_instance.hosting && parr.main_instance.reconnected)
			{
				game.socket.send('c.hl.')

			}
			if (parr.main_instance.reconnected)
			{
				//alert('reconn');
				this.reinit();
			}
			parr.main_instance.reconnected = false;
			game.socket.send('c.l.'+parr.main_instance.login_name)
			game.players.self.login_name=parr.main_instance.login_name;
			this.homeheadview = new Y.HomeHeadView();
		},
		reinit:function()
		{
			initGrid=false;
			initMini=false;
			endgamesent=false;
			gamestarted = false;
			blockById = {}
			blockByIdOp = {}
			spaceview = null;
			is_in_anim = false;
			is_in_anim_op = false;
			anims = {}
			blocksToMove = []
			blocksToMoveOp = []
			blocksToSend = {}
			touched = -1;
			blocksqueue = null
			max_anims = 8
			checkothermovesTO = null;
			miniById = {}
			blockallinputs = false;
			otherplayerwon = false;
			playlosestarted = false;
			playwingamestarted = false;
			reconnected = false;
			parr.main_instance.reconnected = false;

		},
		loginOtherPlayer: function()
		{
			this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:game.players.other.login_name+' s\'est joint &agrave; la partie'}));
			var otherplayer = this.otherplayer = new Y.Player({login_name:game.players.other.login_name});

			this.playerlistview.playerlist.add(otherplayer);
			game.socket.send('c.sc.')
			if (game.players.self.host || parr.main_instance.hosting)
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
			Y.one('#placement_message').setStyle('display','none');
			if (Y.one('#p1')!=undefined) Y.one('#p1').setStyle('display','none');
			if (Y.one('#vs')!=undefined) Y.one('#vs').setStyle('display','none');
			if (Y.one('#p2')!=undefined) Y.one('#p2').setStyle('display','none');

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


			var rightpanel = Y.Node.create('<div id="placement_rightpanel" class="placement_rightpanel"><img src="./images/back_game_intro.jpg" style="width:800px; height:158px"/></div>');

			var nn = Y.Node.create('<div style="float:left; font-size:60px; color:#dddd00; margin-left:100px; font-weight:bold; line-height:130px;" id="myname"> </div><div style="float:left; font-size:70px; color:#dddd00; margin-left:9px; font-weight:bold; line-height:130px;" id="myscore"> </div><div style="float:left; font-size:60px; color:#dddd00; margin-left:170px; font-weight:bold; line-height:130px;" id="otherplayername"> </div><div style="float:left; font-size:70px; color:#dddd00; margin-left:12px; font-weight:bold; line-height:130px;" id="opponentscore"> </div>')
			rightpanel.append(nn);

			var bottompanel = Y.Node.create('<div class="placement_bottompanel"></div>');
			bottompanel.append(this.chatview.render().get('container'));

			submaster.append(leftpanel);
			submaster.append(bottompanel);
			masterdiv.append(submaster)
			this.get('container').append(masterdiv)
		},
		ATTRS:
		{
			thisplayer:{ value: null },
			playerlistview : { value: null },
			chatview : {value:null}
		}
	});

	Y.Game = Y.Base.create('game',Y.View,[],
	{
		grids1:null,
		grids2:null,
		minigrid:null,
		started:false,
		backimg:null,
		initializer: function()
		{
			endgamesent=false;
			initGrid = false

			var c = this.get('container');

			c.setStyle('backgroundColor','#23423e')

			this.backimg = Y.Node.create('<div style="z-index=1; position:absolute; left:0px; top:0px;"><img src="./images/back_game.jpg" style="width:1290; height:650px;"/></div>');
			Y.one('#wrapper').append(this.backimg);

			var m = new Y.Grid({squarewidth:100,squarenum:5,x:40,y:90})
			this.grids1 = new Y.GridView({model:m});
			this.grids1.get('container').setStyle('display','none');
			c.append(this.grids1.get('container'));

			var m = new Y.GridOpponent({squarewidth:100,squarenum:5,x:740,y:90})
			this.grids2 = new Y.GridOpponentView({model:m});
			this.grids2.get('container').setStyle('display','none');
			c.append(this.grids2.get('container'));

			var cgrid = new Y.MiniCubeGrid({x:565,y:250,width:50})
			this.minigrid = new Y.MiniCubeGridView({model:cgrid});
			c.append(this.minigrid.get('container'));

			this.message_top = Y.one('#placement_message')
			var node = this.message_top
			par = this

			if (!parent.main_instance.low_res)
			{
				this.message_top_anim = new Y.Anim({
						node: node,
						from: { opacity: 0 },
						to: { opacity: 1 },
						duration : 0.3
					});
				this.message_top_anim.on('end',function(e)
				{
					var aa = new Y.Anim({
						node: node,
						from: { opacity: 1 },
						to: { opacity: 1 },
						duration : 1
					});
					aa.run()
					aa.on('end',function(e)
					{
						par.message_top.setStyle('display','none')
					});
				});

				this.initAnims()
			}
			var p1 = Y.Node.create('<div class="p1">'+game.players.self.login_name+'</div>');
			var p2 = Y.Node.create('<div class="p2">'+game.players.other.login_name+'</div>');
			c.append(p1);
			c.append(p2);

			setTimeout('say("&Agrave; VOS MARQUES"); parent.app.get(\'activeView\').playAudio(\'rubik\',\'beep\'); ',1000)
			beep_timeout = setTimeout('say("PR&Ecirc;TS"); parent.app.get(\'activeView\').playAudio(\'rubik\',\'beep\'); ',3000)
			beep_timeout2 = setTimeout(' say("PARTEZ!",1);  parent.app.get(\'activeView\').playAudio(\'rubik\',\'beep\');  game.socket.send(\'c.nrs.\')',5000)   // notify real start

			blocksqueue = new Queue();
		},
		realStart:function()
		{
			this.grids1.get('container').setStyle('display','block');
			this.grids2.get('container').setStyle('display','block');
		},
		initAnims:function()
		{
			anims = {}
			for (var i = 0 ; i < max_anims ; i++)
			{
				anims[i]= new Y.Anim({
					node: null,
					duration : animspeed
				});
				anims[i].free = true;
			}
		},
		stopGame:function()
		{
			this.grids1.cadres.setStyles({ display:'none'} )
			this.backimg.setStyles({ display:'none'} )
			parr.app.get('activeView').stopSounds()
			clearTimeout(beep_timeout)
			clearTimeout(beep_timeout2)
			if (checkothermovesTO)
				clearInterval(checkothermovesTO)
			thisapp.showView('home');
		},
		setStartGrid:function(blocks)
		{
			if (!initGrid)
			{
				blocks = Y.JSON.parse(blocks)
				var bl = this.grids1.blockviewlist
				var count = 0

				for (var i in blockById)
				{
					if (blockById.hasOwnProperty(i))
					{
						var b = blockById[i]
						var col = colind[blocks[b.get('model').get('id')]];
						b.get('model').set('color',col)
						b.updateImage(col)
					}
				}

				initGrid=true
			}
			this.updateSnapshot(blocks);
		},
		setStartMini:function(cols)
		{
			if (!initMini)
			{
				initMini=true
				this.minigrid.setCols(JSON.parse(cols))
			}
		},
		processMoveOpponent:function()
		{
			if (is_in_anim_op) return;
			if (blocksqueue.getLength()>0)
			{

				var newblocksmove = blocksqueue.dequeue()
				thisapp.get('activeView').moveOpponentBlocks(newblocksmove)
				if (!stopclickaudio)
					parr.app.get('activeView').playAudio(GAME_NAME,'click');
			}

		},
		moveOpponentBlocks:function(data)
		{
			if (is_in_anim_op) return;
			is_in_anim_op = true;
			data = JSON.parse(data)
			var rootb = data['r']
			var blocks = data['b']
			var toPos = blocks[rootb]
			for (var i in blocks)
			{
				if (blocks.hasOwnProperty(i))
				{
					blocksToMoveOp.push[blockByIdOp[i].get('model').get('id')]
					blockByIdOp[i].moveOne(posind[toPos])
				}
			}
		},
		say: function(msg,gostart)
		{
			if (parent.main_instance.low_res)
			{
				var t = this.message_top;
				t.setHTML(msg);
				t.setStyle('display','block');
				setTimeout('thisapp.get("activeView").message_top.setStyle("display","none")',1300)
			}
			else
			{
				var t = this.message_top;
				t.setStyle('opacity',0);
				t.setStyle('display','block');
				t.setHTML(msg);
				this.message_top_anim.run();
			}

			if (gostart)
			{
				this.started = true;
			}
		},
		playWinGame:function()
		{
			this.started = false;
			var n = Y.Node.create('<div id="won" style="position:absolute; z-index:300; left:125px; top:165px;">')
			var imgn = Y.Node.create('<img src="./images/cadre_win.gif" style="position:absolute; z-index:300">')
			n.append(imgn)
			this.get('container').append(n)

			n = Y.Node.create('<div id="lose" style="position:absolute; z-index:300; left:842px; top:187px;">')
			var imgn = Y.Node.create('<img src="./images/lose.png" width=300 height=300 style="position:absolute; z-index:300">')
			n.append(imgn)
			this.get('container').append(n)

			setTimeout('parent.main_instance.socket.send(\'c.eg.\'); ',5000)

			parr.app.get('activeView').playAudio(GAME_NAME,'win');

			this.grids1.cadres.setStyle('display','none')
			parr.main_instance.reconnected = true;
		},
		playLoseGame:function()
		{
			this.started = false;

			var n = Y.Node.create('<div id="won" style="position:absolute; z-index:300; left:826px; top:167px;">')
			var imgn = Y.Node.create('<img src="./images/cadre_win.gif" style="position:absolute; z-index:300">')
			n.append(imgn)
			this.get('container').append(n)

			n = Y.Node.create('<div id="lose" style="position:absolute; z-index:300; left:137px; top:191px;">')
			var imgn = Y.Node.create('<img src="./images/lose.png" width=300 height=300 style="position:absolute; z-index:300">')
			n.append(imgn)
			this.get('container').append(n)

			setTimeout('parent.main_instance.socket.send(\'c.eg.\'); ',5000)
			parr.app.get('activeView').playAudio(GAME_NAME,'loser');
			this.grids1.cadres.setStyle('display','none')
			parr.main_instance.reconnected = true;
		},
		getSnapshot: function()
		{
			return this.grids1.getSnapshot();
		},
		updateSnapshot: function(snap)
		{
			if (snap!=lastSnap && snap!=undefined)
			{
				lastSnap = snap
			}

			return this.grids2.setSnapshot(snap);
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

				if (!parr.main_instance.reconnected)
					parr.main_instance.socket.send('c.cfg.'+parr.main_instance.activeGame+'|||'+GAME_NAME);
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

					if (accepted || parr.main_instance.debug)
					{

						parr.main_instance.reconnected = false;
						if (parr.main_instance.hosting)
							game.players.self.host = true;

						if (parr.main_instance.debug)
							debug = true;
						if (checkothermovesTO)
							clearInterval(checkothermovesTO)
						thisapp.showView('home');
						parr.main_instance.activeGame='';

					}
					else
						parr.app.get('activeView').setGame('lobby');
				}
				if (parr.main_instance.activeGame==undefined || parr.main_instance.activeGame=='')
				{
					parr.main_instance.activeGame='';
					parr.app.get('activeView').setGame('lobby')
					return;
				}
				parr.main_instance.socket.removeAllListeners('confirm');
				parr.main_instance.socket.on('confirm', f);

				thisapp.showView('login');
		});

		thisapp.navigate('/');
	}
	GameApp = gameapp;

}, '1.0', {requires: ['minicube','chat','playerlist','grids','gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});

