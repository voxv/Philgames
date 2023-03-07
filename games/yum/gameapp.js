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
			Y.one('#wrapper').append(this.backimg);

			this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:'Bienvenue &agrave; Yum!'}));
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
			if (parrframe.main_instance.hosting && parrframe.main_instance.reconnected && game.players.self.host)
			{
				game.socket.send('c.hl.')

			}
			if (parrframe.main_instance.reconnected)
			{
				this.reinit();
			}
			parrframe.main_instance.reconnected = false;
			game.socket.send('c.l.'+parrframe.main_instance.login_name)


			game.socket.send('c.gid.')   // get my id

			if (!game.players.self.host)
				game.socket.send('c.god.')   // get other id

			game.players.self.login_name=parrframe.main_instance.login_name;
			this.homeheadview = new Y.HomeHeadView();
		},
		reinit:function()
		{
			gamestarted = false
			currentTurn = ''
			myturn = false
			subturnbusted = false
			firstThrowDone = false;
			gameended = false;
			has_dice_throw_after_anim = false
			dice_throw_after_anim = {}
			is_in_anim_dice = false;
			my_is_in_anim = false
			dropped = false;
			delete players_info[otherplayerid]
			toThrow = {}
			dddrop = null
			animsqueue = null;
			firstPutInCupDone = false;
			otherhasthrown = true;
			shake_anim = null;
			stop_shake = false;
			tot = {}
			Y.one('#placement_message').setStyle('display','none')
			Y.one('#placement_message2').setStyle('display','none')
			//this.gameboard.recalcResults()
			//this.gameboard.dices = []
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

			if (game.players.self.host || parrframe.main_instance.hosting)
				game.socket.send('c.god.')   // get other id
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
			//delete players_info[otherplayerid]
			this.reinit();
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
		started:false,
		message_top_anim:null,
		message_top_anim2:null,
		gameboard:null,
		scorecard:null,
		initializer: function()
		{

			var c = this.get('container');

			c.setStyle('backgroundColor','#23423e')

			this.backimg = Y.Node.create('<div style="z-index=1; position:absolute; left:0px; top:0px;"><img src="./images/back_game.jpg" style="width:1290; height:900px;"/></div>');
			Y.one('#wrapper').append(this.backimg);

			var c = this.get('container');


			var v = new Y.GameBoard({x:30,y:30,width:470,dicewidth:50})
			this.gameboard = new Y.GameBoardView({model:v})

			this.gameboard.setParent(this)
			this.get('container').append(this.gameboard.get('container'))

			var par = this


			var sc = new Y.Scorecard({x:530,y:30,width:670,height:670})
			this.scorecard = new Y.ScorecardView({model:sc})
			this.get('container').append(this.scorecard.get('container'))


			var node = this.message_top = Y.one('#placement_message')
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
					duration : msg_duration
				});
				aa.run()
				aa.on('end',function(e)
				{
					node.setStyle('display','none')
				});


			});
			var node2 = Y.one('#placement_message2')
			this.message_top_anim2 = new Y.Anim({
					node: node2,
					from: { opacity: 0 },
					to: { opacity: 1 },
					duration : 1
				});
			this.message_top_anim2.on('end',function(e)
			{
				var aa = new Y.Anim({
					node: node2,
					from: { opacity: 1 },
					to: { opacity: 1 },
					duration : 5
				});
				aa.run()
				aa.on('end',function(e)
				{
					node2.setStyle('display','none')
				});
			});
			//if (game.players.self.host)
			//	myturn=true;

			if (myturn)
				this.sayTurn(game.players.self.login_name)
			else
				this.sayTurn(otherplayername)

			animsqueue = new Queue();

		},
		processMoveOpponent:function()
		{
			if (is_in_anim_dice) return;

			if (animsqueue.isEmpty() && has_dice_throw_after_anim)
			{
				has_dice_throw_after_anim = false;

				thisapp.get('activeView').gameboard.throwDices([370,370],dice_throw_after_anim)
				game.socket.send('c.tb.')
				dice_throw_after_anim = {}
				return

			}
			if (!animsqueue.isEmpty())
			{
				//Y.log('animsqueue not empty')
				var newblocksmove = animsqueue.dequeue()
				var nb = JSON.parse(newblocksmove)
				//var nb = newblocksmove
				//Y.log('newblocksmove:'+nb.toSource())
				if (nb.length==1)
					this.gameboard.addDiceInCup(nb[0],true)
				else
				{

					this.gameboard.putDicesInCup(nb,true)

				}

			}

		},
		startShake:function()
		{
			//Y.log('START')
			var par = this
			var cv = this.gameboard.cupview
			var s = cv.get('container')
			var curx = cv.get('model').get('x')
			var cury = cv.get('model').get('y')
			shake_anim = new Y.Anim({
				node: s,
				from: { xy: [curx-30,cury-10] },
				to: { xy: [curx+30,cury+10] },
				duration : 0.1
			});
			shake_anim.run()

			shake_anim.on('end',function(e)
			{
				if (stop_shake)
				{
					//Y.log('stopshake')
					shake_anim.stop()
					stop_shake=false


					/*var endshake_anim = new Y.Anim({
						node: shake_anim.get('node'),
						from: { xy: [cux,cuy] },
						to: { xy: [par.gameboard.cupHome[0],par.gameboard.cupHome[1]] },
						duration : 5
					});
					endshake_anim.run();*/
					//par.gameboard.cupview.get('model').set('x',par.gameboard.cupHome[0])
					//par.gameboard.cupview.get('model').set('y',par.gameboard.cupHome[1])
					//par.gameboard.cupview.render()

				}
				else
				{
					if (shake_anim.get('reverse'))
					{
						shake_anim.set('reverse',false);
						//Y.log('run rev');
						shake_anim.run();
					}
					else
					{
						shake_anim.set('reverse',true);
						//Y.log('run')
						shake_anim.run();
					}
				}
			});
		},
		stopShake:function()
		{
			//Y.log('STOP')
			stop_shake=true;
			/*shake_anim.stop()
			this.gameboard.cupview.get('model').set('x',this.gameboard.cupHome[0])
			this.gameboard.cupview.get('model').set('y',this.gameboard.cupHome[1])
			this.gameboard.cupview.render()*/

		},
		sayTurn: function(player_name)
		{
			this.say('C\'est au tour de '+player_name);
		},
		sayPerma: function(msg)
		{
			var node = Y.one('#placement_message2')
			node.setHTML(msg);
			node.setStyle('display','block');
			node.setStyle('opacity',1)
		},
		stopGame:function()
		{
			this.backimg.setStyles({ display:'none'} )
			parrapp.stopSounds()
			if (checkothermovesTO)
				clearInterval(checkothermovesTO)

			this.gameboard.ddcup.destroy()
			Y.Array.each(this.gameboard.dices, function(d)
			{
				d.ddd.destroy()
				d=null;
			});
			dddrop.destroy()
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
		render: function()
		{
			return this;
		},
		ATTRS:
		{
			grids1 : { value : null },

		}
	});
	Y.RotAnimGame = new Y.Base.create('rotanimgame',Y.Model,[],
	{
		ATTRS:
		{
			deg :{ value:0 },
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

}, '1.0', {requires: ['chat','playerlist','dice','gameboard','scorecard','gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});

