YUI.add("lobby", function(Y) {

	var console = new Y.Console();
	//console.render();
	var debug = '';

	Y.Login = Y.Base.create('login',Y.View,[],
	{
		loginManager:null,
		initializer: function(){

			if (debug!='')
			{
				var parr = parent
				lobby_instance.socket = parent.main_instance.socket;
				lobby_instance.socket.emit('subscribe','lobby')
				parent.main_instance.subscribedTo = 'lobby';
				lobby_instance.socket.send('c.dih.'+debug);
				lobby_instance.socket.on('message', function(data)
				{

					var commands = data.split('.');
					var command = commands[0];
					var subcommand = commands[1] || null;
					var commanddata = commands[2] || null;

					switch(command) {

						case 's': //server message

							switch(subcommand) {

								case 'dih' :   // debug game , is host?

									var d = new Date();
									d = ''+d.getTime();
									d = d.substring(8, 11)
									parr.main_instance.login_name = 'Tester '+d;
									lobby_instance.login_name = 'Tester '+d;
									parr.main_instance.debug = true;
									lobby_instance.socket = parr.main_instance.socket;
									parr.main_instance.activeGame = 'debug'
									lobby_instance.selectedGame = debug;

									if (commanddata=='true')  // is not host
									{
										lobby_instance.sendJoinRequest(debug,'debug');
										lobby_instance.hosting = false;
										parr.main_instance.hosting = false;
									}
									else  // is host
									{
										parr.main_instance.hosting = true;
										lobby_instance.hosting = true;
										lobby_instance.socket.send('c.crd.'+debug);   // create a game
									}
									parr.app.get('activeView').setGame(debug,'debug');
									break;
							}
						break;
					}
				});
			}
			else
				this.loginManager = new Y.LoginManagerView();
		},
		render: function()
		{
			if (debug=='')
				this.get('container').append(this.loginManager.get('container'));
			return this;
		}
	});

	Y.Home = Y.Base.create('home',Y.View,[],
	{
		initializer: function(){

			var toppanel = Y.Node.create('<div class="lobby_toppanel">Bienvenue '+parent.main_instance.login_name+'</div>');
			this.gamelist = Y.Node.create('<div style=" position:absolute; width:1290px; height:650px; left:0px; top:74px"> </div>');

			this.get('container').append(toppanel);
			this.get('container').append(this.gamelist);

			var panelDiv = this.panelDiv = Y.Node.create('<div id="panelContent"></div>');
			var panelDivInner = this.panelDivInner = Y.Node.create('<div class="yui3-widget-bd"> </div>');
			panelDiv.append(panelDivInner);
			this.get('container').append(panelDiv);
			var panel = this.panel = new Y.Panel({
				srcNode      : this.panelDiv,

				width        : 1291,
				height        : 950,
				zIndex       : 5,
				centered     : false,
				modal        : true,
				visible      : false,
				render       : true,
				plugins      : [Y.Plugin.Drag]
			});

			this.message_top = Y.one('#placement_message')
			var node = this.message_top
			var parr = this
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
					var aaa = new Y.Anim({
						node: node,
						from: { opacity: 1 },
						to: { opacity: 0 },
						duration : 0.3
					});
					aaa.run();
					aaa.on('end',function(e)
					{
						parr.message_top.setStyle('display','none')
					});
				});
			});
			//Y.log('c.ggl')
			lobby_instance.socket.send('c.ggl');   // get game list
			parent.main_instance.hosting=false;
		},
		fillAndShowRooms:function(dat)
		{
			var gamename = dat['gamename']
			this.panelDivInner.empty();
			var headmsg = 'Salles de jeux pour '+gamename;
			var panelhead = Y.Node.create('<div class="panel_head"></div>');
			var bimg = Y.Node.create('<img style="width:50px; height:50px;" src="./images/back_button_hover.png"/>');
			var backbutton = Y.Node.create('<div class="panel_backbutton"></div>');
			backbutton.append(bimg);
			var parr = this
			var parrframe = parent

			var f = function(e)
			{
				parr.panel.set('visible',false);
				lobby_instance.selectedGame='';
				parrframe.main_instance.lastSelectedGame = '';
			}
			backbutton.on('mousedown', f);
			backbutton.on('touchstart', f);

			backbutton.on('mouseover', function(e)
			{
				bimg.setAttribute('src','./images/back_button.png');
			});
			backbutton.on('mouseout', function(e)
			{
				bimg.setAttribute('src','./images/back_button_hover.png');
			});

			panelhead.append(backbutton);
			panelhead.append(headmsg);
			this.panelDivInner.append(panelhead);

			var createGameDiv = Y.Node.create('<div class="panel_creategame" id="'+gamename+'">Cr&eacute;er une salle</div>');
			createGameDiv.on('mouseover', function(e)
			{
				createGameDiv.setStyle('color','#2222ff');
				createGameDiv.setStyle('fontSize','18px');
			});
			createGameDiv.on('mouseout', function(e)
			{
				createGameDiv.setStyle('color','#222288');
				createGameDiv.setStyle('fontSize','18px');
			});

			var f = function(e)
			{
				lobby_instance.socket.send('c.cr.'+e.currentTarget.get('id'));   // create a game
				parrframe.main_instance.hosting = true;
			}
			createGameDiv.on('mousedown', f);
			createGameDiv.on('touchstart', f);

			this.panelDivInner.append(createGameDiv);
			this.panel.set('srcNode',this.panelDiv);

			this.panel.set('visible',true);
			this.panelDivInner.append(this.buildRooms(dat));

		},
		buildRooms : function(dat)
		{
			var roomsdata = dat['rooms']
			var housesDiv =  Y.Node.create('<div class="houses"></div>');

			for (var i = 0 ; i < roomsdata.length ; i++)
			{
				var host_name = roomsdata[i]['host_name']
				var clients = roomsdata[i]['clients_name']
				var gameid = roomsdata[i]['gameid']
				var total_players = roomsdata[i]['totplayers']
				var isfull = roomsdata[i]['isfull']
				var started = roomsdata[i]['started']
				var thegame = roomsdata[i];
				var houseDiv =  Y.Node.create('<div class="onehouse"></div>');
				var househead = Y.Node.create('<div class="househead"></div>');
				var househeadimg = Y.Node.create('<div class="househead_image"><img style="width:90px; height:90px" src="./images/house.png"/></div>');
				var parr = this

				var f = function(e)
				{
					if (this.joinlocked) return;

					if (isfull)
					{
						parr.say('La salle est pleine');
						return;
					}
					else if (started)
					{
						parr.say('La partie est d&eacute;j&agrave; en cours');
						return;
					}
					this.joinlocked = true;
					lobby_instance.sendJoinRequest(parrframe.main_instance.lastSelectedGame,gameid);
				}
				househeadimg.on('mousedown',f)
				househeadimg.on('touchstart',f)
				househead.append(househeadimg)

				var statusmsg = '<span style="color:#000000;">Salle '+(i+1)+' - '
				var col = '#009933';
				var msg = 'En attente de joueurs...';
				if (started)
				{
					col = '#5c5c3d';
					msg = 'Partie en cours...';
				}
				else if (isfull)
				{
					col = '#991f00';
					msg = 'Limite de joueurs atteinte';
				}
				statusmsg += '<span style="font-weight:plain; font-size:15px; color:'+col+';">'+msg+'</span></span>';

				var househead_infos = Y.Node.create('<div class="househead_infos"><div class="househead_infos_head">'+statusmsg+'</div></div>');
				househead.append(househead_infos)
				houseDiv.append(househead);

				var pl_names = '';
				pl_names+='<div class="house_one_player">'+host_name+'</div>';

				for (var j = 0 ; j < thegame.clients_name.length ; j++)
				{
					pl_names+='<div class="house_one_player">'+thegame.clients_name[j]+'</div>';
				}
				househead_infos.append('<div style="font-size:18px; color:#222255; clear:both;">'+pl_names+'</div>');
				housesDiv.append(houseDiv);
			}
			return housesDiv;
		},
		updateGameList:function(dat)
		{
			var tot = '';
			this.gamelist.empty();
			if (parrframe.main_instance.lastSelectedGame!='')
			{
				this.fillAndShowRooms(dat[parrframe.main_instance.lastSelectedGame]);
			}
			for (var i in dat)
			{
				if (dat.hasOwnProperty(i))
				{
					var roominfo = dat[i];

					var splashimg = roominfo['splashpath'];
					var gamename = roominfo['gamename'];

					var cc = Y.Node.create('<div class="lobby_gamelist_item" id="'+gamename+'">');
					var g = '<img style="width:100%; height:90%;" src="../'+splashimg+'.jpg"/>';
					var jstr = 'joueurs'
					var jestr = 's';

					var rooms = roominfo['rooms'];
					var totplayers = 0;
					for (var j = 0 ; j < rooms.length ; j++)
						totplayers+=parseInt(rooms[j]['totplayers']);

					if (totplayers == 1)
					{
						jstr = 'joueur'
						jestr = '';
					}
					var gnumplayers = '<div style="text-align:center; font-weight:bold; width:298; margin-left:-1px; height:10%; background-color:#cfcfdf; border:solid 2px #444444;">'+totplayers+' '+jstr+' connect&eacute;'+jestr+'</div>';
					var gg = Y.Node.create(g);
					var gname = i;
					var parr = this;

					var f = function(e)
					{
						lobby_instance.selectedGame = e.currentTarget.get('id');
						var newroom = { rooms:[],gamename: e.currentTarget.get('id'),splashpath:'' }
						parrframe.main_instance.lastSelectedGame = e.currentTarget.get('id')
						parr.fillAndShowRooms(dat[e.currentTarget.get('id')]);
						e.preventDefault();
						return false;
					}
					cc.on('touchstart', f);
					cc.on('mousedown',  f);

					cc.append(gg);
					cc.append(gnumplayers)

					this.gamelist.append(cc);
				}
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
		render: function()
		{
			return this;
		}
	});

	var lobby = function()
	{
		app = new Y.App({
			views: {
				 login   : {type: 'Login'},
				 home   : {type: 'Home'}
			},
			viewContainer: '#wrapper',
			serverRouting : false,
		});

		var parr = parent

		app.route('/', function () {

			if (parr.main_instance.login_name=='')
			{
				app.showView('login');
			}
			else
			{
				lobby_instance.login_name = parr.main_instance.login_name;
				lobby_instance.client_connect_to_server(lobby_instance.login_name);
				lobby_instance.socket.send('c.cg.')  // clear my games
				app.showView('home');

			}
		});

		app.navigate('/');
	}
	Lobby = lobby;

}, '1.0', {requires: ['loginmanager','gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io','cookie']});

