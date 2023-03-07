YUI.add("gameapp", function(Y) {

	var console = new Y.Console();
	//console.render();

	var parrframe = parent;

	Y.Login = Y.Base.create('login',Y.View,[],
	{
		initializer: function(){ },
		render: function()
		{
			return this
		}
	});

	Y.PreGame = Y.Base.create('pregame',Y.View,[],
	{
		gridview : null,
		ships:[],
		chatview:null,
		initializer: function(){

			lobby_audio = new Audio('./sounds/lobby.mp3');
			lobby_audio.loop = true;
			lobby_audio.play();

			var mygrid = new Y.MyGrid({width:500,division:10});
			this.gridview = new Y.MyGridView({model:mygrid});

			this.chatview = new Y.ChatView();
			this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:'Place tes bateaux en les glissant sur la grille. Pour faire une rotation click sur le bateau.'}));

			this.message_top = Y.one('#placement_message')
			var node = this.message_top
			par = this


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
					duration : 4
				});
				aa.run()
				aa.on('end',function(e)
				{
					if (par.message_top!=undefined)
					par.message_top.setStyle('display','none')
				});
			});

			this.message_top_wide = Y.one('#placement_message_wide')

			var node = this.message_top_wide
			this.message_top_anim_wide = new Y.Anim({
					node: node,
					from: { opacity: 0 },
					to: { opacity: 1 },
					duration : 0.6
				});
			this.message_top_anim_wide.on('end',function(e)
			{

				var aa = new Y.Anim({
					node: node,
					from: { opacity: 1 },
					to: { opacity: 1 },
					duration : 3.5
				});
				aa.run()
				aa.on('end',function(e)
				{
					if (par.message_top_wide!=undefined)
						par.message_top_wide.setStyle('display','none')
				});
			});

		},
		stopGame:function()
		{
			parrframe.app.get('activeView').stopSounds()
			if (lobby_audio)
				lobby_audio.pause()
			if (audio_sea)
				audio_sea.pause()
			Y.one('#wrapper').setStyle('backgroundImage',"url('./images/back.png')");
			thisapp.showView('home');
		},
		startGame:function(data)
		{

			players_ships = data
			var current_turn = players_ships['current_turn']

			if (game.players.self.host)
			{
				if (current_turn=='host') myturn = true;
				else myturn=false;
			}
			else
			{
				if (current_turn=='other') myturn = true;
				else myturn=false;
			}

			delete players_ships['current_turn']

			this.gridview.minigrid_graphic.removeAllShapes()
			Y.one('#placement_message').setStyle('display','none')
			parrframe.app.get('activeView').stopSounds()
			lobby_audio.pause();

			this.message_top_anim_wide.stop();
			this.message_top_wide.setStyle('display','none')

			thisapp.showView('game')

		},
		getShipsForSave: function()
		{
			var ret = {};
			count = 1;
			Y.Array.each(this.ships, function(s)
			{
				if (s.targetSquares.length>0)
				ret['c'+count++] = s.targetSquares;
			});

			return ret;
		},
		activateGoButton:function()
		{
			var m = this.get('container').one('#buttonprediv');
			m.setStyle('display','block');
			m = this.get('container').one('#startbutton_pre')
			m.set('disabled','')
		},
		deactivateGoButton:function()
		{
			var m = this.get('container').one('#buttonprediv');
			if (m)
				m.setStyle('display','none');
			m = this.get('container').one('#startbutton_pre')
			m.set('disabled','disabled')
		},
		sayWide: function(msg)
		{
			var t = this.message_top_wide;
			t.setStyle('opacity',0);
			t.setStyle('display','block');
			t.setHTML(msg);
			//console.log('saywide:'+msg)
			this.message_top_anim_wide.run();
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
		render: function()
		{
			var leftpanel = Y.Node.create('<div class="placement_leftpanel"></div>');
			leftpanel.append(playerlistview_glob.render().get('container'));
			var buttonDiv = Y.Node.create('<div id="buttonprediv" class="start_game_button_pre"><button disabled=disabled class="startbutton_pre" id="startbutton_pre">D&eacute;buter</button></div>');
			buttonDiv.setStyle('display','none');

			buttonDiv.one('#startbutton_pre').on('click',function(e)
			{
				startbuttonclicked = true;

				// TODO
				game.socket.send('c.ss.'+Y.JSON.stringify(thisapp.get('activeView').getShipsForSave()));   // submit ships
				/*	data = { 'thisplayer':playerInfo['id'], 'action':'submitships', 'ships':app.get('activeView').getShipsForSave() }

					Y.io('index.ajax.php', {
						method: 'POST',
						data: data,
						on: {
							success: function(id,response) { submitted = response.responseText },
							failure: function(transactionid, response, arguments){   }
						}
					});
				*/

				var t = e.currentTarget;
				t.removeClass('startbutton_pre');
				t.addClass('startbutton_pre_activated');
				t.set('disabled','true');
			});
			leftpanel.append(buttonDiv);

			//rigth panel (grid)
			var rightpanel = Y.Node.create('<div id="placement_rightpanel" class="placement_rightpanel"></div>');
			rightpanel.append(this.gridview.render().get('container'));

			//bottom panel(chat)
			var bottompanel = Y.Node.create('<div class="placement_bottompanel"></div>');
			bottompanel.append(this.chatview.render().get('container'));

			this.get('container').append(leftpanel);
			this.get('container').append(rightpanel);
			//this.get('container').append(bottompanel);

			var s1 = new Y.Ship({scale:2,x:230,y:180,image:'./images/ship1.png',width:250,height:50,numSquares:5});
			var s1view = new Y.ShipView({model:s1});
			rightpanel.append(s1view.render().get('container'));
			this.ships.push(s1view);

			var s2 = new Y.Ship({scale:2,x:230,y:270,image:'./images/ship2.png',width:200,height:50,numSquares:4});
			var s2view = new Y.ShipView({model:s2});
			rightpanel.append(s2view.render().get('container'));
			this.ships.push(s2view);

			var s3 = new Y.Ship({scale:2,x:230,y:360,image:'./images/ship3.png',width:150,height:50,numSquares:3});
			var s3view = new Y.ShipView({model:s3});
			rightpanel.append(s3view.render().get('container'));
			this.ships.push(s3view);

			var s4 = new Y.Ship({scale:2,x:230,y:450,image:'./images/ship4.png',width:150,height:50,numSquares:3});
			var s4view = new Y.ShipView({model:s4});
			rightpanel.append(s4view.render().get('container'));
			this.ships.push(s4view);

			var s5 = new Y.Ship({scale:2,x:230,y:540,image:'./images/ship5.png',width:100,height:50,numSquares:2});
			var s5view = new Y.ShipView({model:s5});
			rightpanel.append(s5view.render().get('container'));
			this.ships.push(s5view);


			this.say('Place tes bateaux')

			return this
		}
	});

	Y.Home = Y.Base.create('home',Y.View,[],
	{
		showWaiting: true,
		backimg:null,
		initializer: function()
		{
			this.backimg = Y.Node.create('<div style="z-index:-1; position:absolute; left:0px; top:0px;"><img src="./images/back.png" style="width:1290; height:650px;"/></div>');
			Y.one('#wrapper').append(this.backimg);

			game.players.self.login_name=parrframe.main_instance.login_name

			playerlistview_glob = this.playerlistview = new Y.PlayerListView();
			var thisplayer = this.thisplayer = new Y.Player({id:game.players.self.id,login_name:game.players.self.login_name});
			this.playerlistview.playerlist.add(thisplayer);

			var chatview = this.chatview = new Y.ChatView();

			this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:'Bienvenue &agrave; Battleship!'}));
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

			Y.one('#body').setStyle('backgroundColor','#000000');
			Y.one('#end_message').setStyle('display','none');

		},
		reinit:function()
		{
			players_ships = {}
			submitted = false;
			myturn = true;
			lastsquarepicked = -1;
			gamestarted = false;
			ships_sunken = 0;
			ships_enemy_sunken = 0;
			dd = null;
			old_number_message = 0;
			found_ships = {"c1":[],"c2":[],"c3":[],"c4":[],"c5":[]}
			startbuttonclicked = false;
			won = -1;
			gamerestarted = true;
			clickblock = false;

			parrframe.app.get('activeView').stopSounds();
			Y.one('#placement_message_game').setStyle('display','none');
			Y.one('#centered_message').setStyle('display','none');
			Y.one('#placement_message').setStyle('display','none');
			Y.one('#end_message').setStyle('display','none');
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
		loginOtherPlayer: function()
		{
			this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:game.players.other.login_name+' s\'est joint &agrave; la partie'}));
			var otherplayer = this.otherplayer = new Y.Player({login_name:game.players.other.login_name});
			otherplayername = game.players.other.login_name
			this.playerlistview.playerlist.add(otherplayer);
			game.socket.send('c.sc.')
			if (game.players.self.host || parrframe.main_instance.hosting)
				this.activateGoButton()
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
			thisapp.showView('pregame');
		},
		render: function()
		{


			var masterdiv = Y.Node.create('<div class="master_home"></div>')
			masterdiv.append(this.homeheadview.get('container'));

			var submaster  = Y.Node.create('<div class="sub_master"></div>')

			var leftpanel = Y.Node.create('<div class="placement_leftpanel"></div>');
			Y.one('#placement_message').setStyle('display','none');

			leftpanel.append(this.playerlistview.render().get('container'));
			var par = this

			var buttonDiv = Y.Node.create('<div id="buttondiv" class="start_game_button" style="display:none"><button class="startbutton" id="startbutton">GO!</button></div>');

			var f = function(e)
			{
					game.socket.send('c.sg.');   // start game
			};
			buttonDiv.one('#startbutton').on('mousedown',f);
			buttonDiv.one('#startbutton').on('touchstart',f);
			leftpanel.append(buttonDiv);

			var bottompanel = Y.Node.create('<div class="placement_bottompanel"></div>');
			bottompanel.append(this.chatview.render().get('container'));

			submaster.append(leftpanel);
			submaster.append(bottompanel);
			masterdiv.append(submaster)

			this.get('container').append(masterdiv)
		}
	});

	Y.Game = Y.Base.create('game',Y.View,[],
	{
		chatview:null,
		placed_ships:[],
		message_anim:null,
		gridplayerviewClickable:null,
		initializer: function()
		{
			endgamesent=false;

			var c = this.get('container');

			c.setStyle('backgroundColor','#23423e')

			//this.backimg = Y.Node.create('<div style="z-index=1; position:absolute; left:0px; top:0px;"><img src="./images/back_game.jpg" style="width:1290; height:650px;"/></div>');
			//Y.one('#wrapper').append(this.backimg);


			this.message_top = Y.one('#placement_message')

			var node = this.message_top
			par = this

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
					if (par.message_top!=undefined)
						par.message_top.setStyle('display','none')
				});
			});



			var p1 = Y.Node.create('<div class="p1">'+game.players.other.login_name+'</div>');
			var p2 = Y.Node.create('<div class="p2">'+game.players.self.login_name+'</div>');
			c.append(p1);
			c.append(p2);

			audio_sea = new Audio('./sounds/ambiancesea.mp3');
			audio_sea.loop = true;
			audio_sea.play();

			Y.one('#wrapper').setStyle('backgroundImage',"url('./images/back_game.jpg')");
			/*for (var i in players_ships)
			{
				if (i.length==6 && i!=playerInfo['id'])
					otherplayerid = i
			}*/

			var chatview = this.chatview = new Y.ChatView();

			var nodee = Y.one('#placement_message_game');
			this.message_anim = new Y.Anim({
				node: nodee,
				from: { opacity: 0 },
				to: { opacity: 1 },
				duration : 1
			});

			var node2 = Y.one('#centered_message');
			this.centered_anim = new Y.Anim({
				node: node2,
				from: { opacity: 0 },
				to: { opacity: 1 },
				duration : 0.5
			});
			this.centered_anim.on('end', function()
			{
				var t_anim = new Y.Anim({
					node: node2,
					from: { opacity: 1 },
					to: { opacity: 1 },
					duration : 2
				});
				t_anim.run()
				t_anim.on('end', function()
				{
					var t_anim2 = new Y.Anim({
						node: node2,
						from: { opacity: 1 },
						to: { opacity: 0 },
						duration : 0.5
					});
					t_anim2.run();
				});

			});
			var node3 = Y.one('#gameover_message')
			this.centered_nofade_anim = new Y.Anim({
				node: node3,
				from: { opacity: 0 },
				to: { opacity: 1 },
				duration : 3
			});

			if (myturn)
				thisapp.get('activeView').say('C\'est ton tour.');
			else
			{
				if (game.players.other.login_name.length > 0)
					thisapp.get('activeView').say('C\'est &agrave; '+otherplayername+'.');
			}

		},
		stopGame:function()
		{
			parrframe.app.get('activeView').stopSounds()
			if (lobby_audio)
				lobby_audio.pause()
			if (audio_sea)
				audio_sea.pause()
			Y.one('#wrapper').setStyle('backgroundImage',"url('./images/back.png')");
			thisapp.showView('home');
		},
		say: function(msg)
		{
			var t = this.message_top;
			t.setStyle('opacity',0);
			t.setStyle('display','block');
			t.setHTML(msg);
			this.message_top_anim.run();
		},
		sayCentered: function(msg)
		{
			Y.one('#centered_message').setStyle('opacity',0);
			Y.one('#centered_message').setHTML(msg);
			this.centered_anim.run();
			Y.one('#centered_message').setStyle('display','block');

		},
		sayCenteredNoFade: function(msg)
		{
			Y.one('#centered_message').setStyle('display','none');
			Y.one('#placement_message_game').setStyle('display','none');
			Y.one('#gameover_message').setStyle('opacity',0);

			Y.one('#gameover_message').setHTML(msg);
			this.centered_nofade_anim.run();
			Y.one('#gameover_message').setStyle('display','block');
		},
		playGameOver: function()
		{
			var pships = null;
			var pships_ori = null;

			if (game.players.self.host || parrframe.main_instance.hosting)
			{
				pships_ori = players_ships['other'];
			}
			else
			{
				pships_ori = players_ships['host'];
			}
			pships = JSON.parse(pships_ori);

			//console.log('found_ships:'+found_ships.toSource())
			if (found_ships['c1'].length!=pships['c1'].length)
			{
					var min = Math.min.apply(null, pships['c1'])
					g = thisapp.get('activeView').gridplayerviewClickable;
					var s = new Y.StaticShip({x:g.getCoords(min)[0],y:g.getCoords(min)[1],image:'./images/ship1.png',width:250,height:50,numSquares:5,isvertical:thisapp.get('activeView').checkVertical(pships['c1'])});
					var sview = new Y.StaticShipView({model:s});
					thisapp.get('activeView').get('container').append(sview.render().get('container'));
			}
			if (found_ships['c2'].length!=pships['c2'].length)
			{
					var min = Math.min.apply(null, pships['c2'])
					g = thisapp.get('activeView').gridplayerviewClickable;
					var s = new Y.StaticShip({x:g.getCoords(min)[0],y:g.getCoords(min)[1],image:'./images/ship2.png',width:200,height:50,numSquares:4,isvertical:thisapp.get('activeView').checkVertical(pships['c2'])});
					var sview = new Y.StaticShipView({model:s});
					thisapp.get('activeView').get('container').append(sview.render().get('container'));
			}
			if (found_ships['c3'].length!=pships['c3'].length)
			{
					var min = Math.min.apply(null, pships['c3'])
					g = thisapp.get('activeView').gridplayerviewClickable;
					var s = new Y.StaticShip({x:g.getCoords(min)[0],y:g.getCoords(min)[1],image:'./images/ship3.png',width:150,height:50,numSquares:3,isvertical:thisapp.get('activeView').checkVertical(pships['c3'])});
					var sview = new Y.StaticShipView({model:s});
					thisapp.get('activeView').get('container').append(sview.render().get('container'));
			}
			if (found_ships['c4'].length!=pships['c4'].length)
			{
					var min = Math.min.apply(null, pships['c4'])
					g = thisapp.get('activeView').gridplayerviewClickable;
					var s = new Y.StaticShip({x:g.getCoords(min)[0],y:g.getCoords(min)[1],image:'./images/ship4.png',width:150,height:50,numSquares:3,isvertical:thisapp.get('activeView').checkVertical(pships['c4'])});
					var sview = new Y.StaticShipView({model:s});
					thisapp.get('activeView').get('container').append(sview.render().get('container'));
			}
			if (found_ships['c5'].length!=pships['c5'].length)
			{
					var min = Math.min.apply(null, pships['c5'])
					g = thisapp.get('activeView').gridplayerviewClickable;
					var s = new Y.StaticShip({x:g.getCoords(min)[0],y:g.getCoords(min)[1],image:'./images/ship5.png',width:100,height:50,numSquares:2,isvertical:thisapp.get('activeView').checkVertical(pships['c5'])});
					var sview = new Y.StaticShipView({model:s});
					thisapp.get('activeView').get('container').append(sview.render().get('container'));
			}
			this.sayCenteredNoFade('Bataille Termin&eacute;e!');
			setTimeout('gotoendgame()',10000);


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



			// TODO
			setTimeout('parent.main_instance.socket.send(\'c.eg.\'); ',5000)

			parrframe.app.get('activeView').playAudio(GAME_NAME,'win');

			parrframe.main_instance.reconnected = true;
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
			parrframe.app.get('activeView').playAudio(GAME_NAME,'loser');

			parrframe.main_instance.reconnected = true;
		},
		checkVertical: function(arr)
		{
			if (Math.abs(arr[1]-arr[0])>1) return 0
			return 1;
		},
		consumeMove:function(vv)
		{
			var test = 0
			var activeview = thisapp.get('activeView')
			var pos = activeview.gridplayerview.getXYFromSquareId(vv['square'])
			if (vv['ishit']!=1)
			{
				var nodee = Y.Node.create('<div class="fire" style="z-index:35; position:absolute; top:'+(pos[1]-12-22)+'px; left:'+(pos[0]-18)+'px; width:50px; height:50px;"><img width=90 height=90 src="./images/splouch.gif"></div>')

				activeview.get('container').append(nodee);
				var anim = new Y.Anim({
					node: nodee,
					from: { opacity: 1 },
					to: { opacity: 1 },
					duration : 1
				});
				anim.on('end', function()
				{
					//console.log('set to white '+vv['square']);
					activeview.gridplayerview.setToWhite(vv['square'])
					var n = this.get('node');

					//node.one('img').get('parentNode').one('img').set('src','single_white.png')

					 n.get('parentNode').removeChild(n);

				});
				anim.run();

				parrframe.app.get('activeView').playAudio(GAME_NAME,'splash1')

				//app.get('activeView').get('container').append('<div class="fire" style="z-index:35; position:absolute; top:'+(pos[1]-12-22)+'px; left:'+(pos[0]-18)+'px; width:50px; height:50px;"><img width=90 height=90 src="0009.gif"></div>');

				myturn = true;

			}
			else
			{
				activeview.get('container').append('<div class="fire" style="z-index:35; position:absolute; top:'+(pos[1]-12)+'px; left:'+pos[0]+'px; width:50px; height:50px;"><img width=50 height=50 src="./images/fire_anim.gif"></div>');

				if ((ships_enemy_sunken+1)!=5)
					parrframe.app.get('activeView').playAudio(GAME_NAME,'bomb1')

				if (vv['completed']==1)
				{
					var audio0 = new Audio('./sounds/bigboom.mp3');
					audio0.loop = false;
					if ((ships_enemy_sunken+1)!=5)
					audio0.play();

					activeview.sayCentered('Capitaine! Nous avons perdu un bateau!');
					ships_enemy_sunken++;
					if (ships_enemy_sunken>=5)
					{
						lastwon=otherplayername;
						won = 0;
						clickblock=true;
						myturn=false;
						thisapp.get('activeView').playGameOver()
						return;
					}
				}

			}

			if (vv['ishit']==0)
			{
				if (myturn)
					activeview.say('C\'est ton tour.');
				else
					activeview.say('C\'est &agrave; '+otherplayername+'.');
			}


			this.gridplayerviewClickable.resetMouseDown()
		},
		render:function()
		{
			offsettop = 95;

			var gridplayer = new Y.GridPlayer({width:500,division:10,offsetx:700,offsety:offsettop,hoverable:0});
			var newv = this.gridplayerview = new Y.GridPlayerView({model:gridplayer});
			this.get('container').append(newv.render().get('container'));

			var pships = null;
			var pships_ori = null;
			//alert(players_ships['host'])
			if (game.players.self.host || parrframe.main_instance.hosting)
			{
				pships_ori = players_ships['host'];
			}
			else
			{
				pships_ori = players_ships['other'];
			}
			pships = JSON.parse(pships_ori);

			//var pships = players_ships[otherplayerid];


			var cgridplayer = new Y.GridPlayer({width:500,division:10,offsetx:60,offsety:offsettop,hoverable:1});
			var newv2 = this.gridplayerviewClickable = new Y.GridPlayerView({model:cgridplayer});
			this.get('container').append(newv2.render().get('container'));



			var s = new Y.StaticShip({x:newv.getCoords(pships['c1'][0])[0],y:newv.getCoords(pships['c1'][0])[1],image:'./images/ship1.png',width:250,height:50,numSquares:5,isvertical:this.checkVertical(pships['c1'])});
			var sview = new Y.StaticShipView({model:s});
			this.get('container').append(sview.render().get('container'));
			this.placed_ships.push(sview);

			var s2 = new Y.StaticShip({x:newv.getCoords(pships['c2'][0])[0],y:newv.getCoords(pships['c2'][0])[1],image:'./images/ship2.png',width:200,height:50,numSquares:4,isvertical:this.checkVertical(pships['c2'])});
			var s2view = new Y.StaticShipView({model:s2});
			this.get('container').append(s2view.render().get('container'));
			this.placed_ships.push(s2view);

			var s3 = new Y.StaticShip({x:newv.getCoords(pships['c3'][0])[0],y:newv.getCoords(pships['c3'][0])[1],image:'./images/ship3.png',width:150,height:50,numSquares:3,isvertical:this.checkVertical(pships['c3'])});
			var s3view = new Y.StaticShipView({model:s3});
			this.get('container').append(s3view.render().get('container'));
			this.placed_ships.push(s3view);

			var s4 = new Y.StaticShip({x:newv.getCoords(pships['c4'][0])[0],y:newv.getCoords(pships['c4'][0])[1],image:'./images/ship4.png',width:150,height:50,numSquares:3,isvertical:this.checkVertical(pships['c4'])});
			var s4view = new Y.StaticShipView({model:s4});
			this.get('container').append(s4view.render().get('container'));
			this.placed_ships.push(s4view);

			var s5 = new Y.StaticShip({x:newv.getCoords(pships['c5'][0])[0],y:newv.getCoords(pships['c5'][0])[1],image:'./images/ship5.png',width:100,height:50,numSquares:2,isvertical:this.checkVertical(pships['c5'])});
			var s5view = new Y.StaticShipView({model:s5});
			this.get('container').append(s5view.render().get('container'));
			this.placed_ships.push(s5view);





		}

	});

	Y.GameFinish = Y.Base.create('gamefinish',Y.View,[],
	{
		initializer: function()
		{
			//TODO
			/*data = { 'thisplayer':playerInfo['id'], 'action':'endgame', 'lastwon':lastwon }

			Y.io('index.ajax.php', {
				method: 'POST',
				data: data,
				on: {
					success: function(id,response) {  Y.log(response.responseText)  },
					failure: function(transactionid, response, arguments){   }
				}
			});*/

			players_ships = {}
			submitted = false;
			//myturn = true;
			lastsquarepicked = -1;
			gamestarted = false;
			ships_sunken = 0;
			ships_enemy_sunken = 0;
			dd = null;
			old_number_message = 0;
			found_ships = {"c1":[],"c2":[],"c3":[],"c4":[],"c5":[]}
			startbuttonclicked = false;
			Y.one('#placement_message_game').setStyle('display','none');
			Y.one('#centered_message').setStyle('display','none');
			Y.one('#gameover_message').setStyle('display','none');
			parrframe.app.get('activeView').stopSounds();

			Y.one('#wrapper').setStyle('backgroundImage',"url('./images/ind1.png')");
			if (won==1)
			{
				parrframe.app.get('activeView').playAudio(GAME_NAME,'win2');

				Y.one('#end_message').setStyle('backgroundImage',"url('./images/trophywon.jpg')");
				parent.main_instance.socket.send('c.iw.')  // I win
			}
			else
			{
				parrframe.app.get('activeView').playAudio(GAME_NAME,'lose1');
				Y.one('#end_message').setStyle('backgroundImage',"url('./images/lost.jpg')");

			}
			n = Y.one('#end_message');

			anim = new Y.Anim({
				node: n,
				from: { opacity: 0 },
				to: { opacity: 1 },
				duration : 3
			});

			n.setStyle('opacity',0);
			n.setStyle('display','block');
			anim.run();
			won = -1;
			gamerestarted = true;
			setTimeout('parent.main_instance.socket.send(\'c.eg.\'); ',8000)

			parrframe.main_instance.reconnected = true;
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
				pregame : {type: 'PreGame'},
				game : {type: 'Game'},
				gamefinish : {type: 'GameFinish'},
			},
			viewContainer: '#wrapper',
			serverRouting : false,
		});


		thisapp.route('/', function () {

				if (!parrframe.main_instance.reconnected)
					parrframe.main_instance.socket.send('c.cfg.'+parrframe.main_instance.activeGame+'|||'+GAME_NAME);
				else
				{
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

}, '1.0', {requires: ['chat','playerlist','grids','gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});

