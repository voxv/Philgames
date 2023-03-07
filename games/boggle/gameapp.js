YUI.add("gameapp", function(Y) {

	var console = new Y.Console();
	console.render();

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
		chatviewmini:null,
		definition_panel: null,
		password_panel: null,
		foundwordlist: null,
		gameconfig: null,
		solution:null,
		inResults:false,
		hasResults: false,
		letters:[],
		rgrid_attached:false,
		pointages: {},
		maxword:'',
		winnerName:'',
		scores:{},
		initializer: function()
		{

			this.reinit()
			game.players.self.login_name=parrframe.main_instance.login_name

			var playerlistview = this.playerlistview = new Y.PlayerListView();

			var chatview = this.chatview = new Y.ChatView();
			var chatviewmini = this.chatviewmini = new Y.ChatViewMini();

			this.backimg = Y.Node.create('<div style="z-index:-1; position:absolute; left:0px; top:0px;"><img src="./images/back3.jpg" style="width:1290; height:900px;"/></div>');
			//this.backimg = Y.Node.create('<div></div>')
			Y.one('#wrapper').append(this.backimg);

			if (!parrframe.main_instance.reconnected) {
				this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:'Bienvenue &agrave; Boggle!'}));
				if (game.players.self.host && !gamestarted)
					this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:'En attente d\'un adversaire'}));
			} else {

				//if (game.players.self.host && !gamestarted)
				//	this.chatviewmini.chatentrylist.add(new ChatEntryModel({user:'Info',content:'glop'}));
			}

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
			if (parrframe.main_instance.reconnected) {
				game.socket.send('c.getpointage.')
				this.hasResults = true
			}

			parrframe.main_instance.reconnected = false;

			////////////////////


				if (parrframe.main_instance.hosting)
				var ishost = 1
				/*console.log('CRISS')
				if (pointage_calculated!="") {
					console.log('HOLY SHIT!')
					console.log(pointage_calculated)
				}else {
					console.log('crtap SHIT!')
				}*/
				//this.gameconfig = new Y.GameConfigView({is_admin:ishost,show_full:true});
				//this.gameconfig.render()
		},
		onRowClick: function(tableId, callback) {
			var table = document.getElementById(tableId),
				rows = table.getElementsByTagName("tr"),
				i;
				console.log('l='+rows.length)
			for (i = 0; i < rows.length; i++) {
				console.log('settingonclick for: '+i)
				table.rows.onclick = function (row) {

					return function () {
						callback(row);
					};
				}(table.rows[i]);
			}
		},
		setResultsHandlers: function() {

				var theid = ''
				for (var i in players_info)
				{
					if (players_info.hasOwnProperty(i) && i!='toSource'){
						console.log('looking for '+'#playername_'+i)
						theid = i
						if (Y.one('#playername_'+i) )
						{
							var pnode = Y.one('#playername_'+i);
							pnode.setStyle('cursor','pointer');
							pnode.setStyle('height','48px')
							pnode.on('click',function(e){  /*alert(this.get('id').replace('playername_',''));*/ result_view.setPlayer(this.get('id').replace('playername_','')).render(); },pnode);
						}
					}
				}
		},
		setChatMsg: function(contentmsg,username) {
			if (this.hasResults) {
				console.log('CONTMSG:'+contentmsg)
				thisapp.get('activeView').chatviewmini.chatentrylist.add(new ChatEntryModel({user:username,content:decodeURIComponent(contentmsg)}));
			} else {
				thisapp.get('activeView').chatview.chatentrylist.add(new ChatEntryModel({user:username,content:decodeURIComponent(contentmsg)}));
			}
		},
		showResults: function() {
			//game.socket.send('c.sc.')
			//console.log('show reulst!!!')
		//	game.socket.send('c.getpointage.')
			global_results = this.solution
			//console.log(global_results.toSource())
            Y.one('#resultGrid').show();
            Y.one('#draw_mini').show();
			playersingame = [];
			Y.one('.playerviewcontainer').setStyle('height','554px')
			in_game_got_duration=false;
			//Y.one('#wrapper').setStyle('backgroundImage','url("images/desktop-backgrounds-computers-apple-mac-parquet.jpg")');
			Y.one('body').on('click',function(e)
			{
				if (definition_shown)
				{
					if (this.definition_panel)
					{
						this.definition_panel.hide();
						definition_shown=false;
					}
				}

			},this);

			 definition_panel = this.definition_panel = new Y.Panel({
				    bodyContent: '<div></div>',
				    width      : 464,
				    zIndex     : 50,
				    centered   : true,
				    modal      : true,
				    render     : '#wrapper',
				    visible    : false

				});
				 password_panel = this.password_panel = new Y.Panel({
				    bodyContent: '<div class="enter_pass"><label for"pass_input">Entre le mot de passe:&nbsp;&nbsp;&nbsp;</label><input type="password" id="pass_input" value="'+(has_grant?'phil':'')+'"/> </div><div id="pass_error"></div> ',
				    width      : 464,
				    height      : 220,
				    zIndex     : 51,
				    centered   : true,
				    modal      : true,
				    render     : '#wrapper',
				    visible    : false

				});
				addword_panel = this.addword_panel = new Y.Panel({
				    bodyContent: '<div class="enter_pass"><label for"pass_input">Entre le mot de passe:&nbsp;&nbsp;&nbsp;</label><input type="password" id="pass_input_add" value="'+(has_grant?'phil':'')+'"/> </div><div id="pass_error_add"></div><div class="verify_def_div"><label for"verify_def_button">VÃ©rifier si je peux trouver une dÃ©finition</label><button id="verify_def_button">VÃ©rifier</button></div> ',
				    width      : 464,
				    height      : 220,
				    zIndex     : 51,
				    centered   : true,
				    modal      : true,
				    render     : '#wrapper',
				    visible    : false

				});
				this.password_panel.addButton({
					value  : 'Retirer de la base de donnÃ©e',
					section: Y.WidgetStdMod.FOOTER,
					action : function (e) {
						e.preventDefault();
						app.get('activeView').verifyPassword();
					}
				});
				this.addword_panel.addButton({
					value  : 'Ajouter Ã  la base de donnÃ©e',
					section: Y.WidgetStdMod.FOOTER,
					action : function (e) {
						e.preventDefault();
						app.get('activeView').verifyPasswordAdd();
					}
				});
				var but = this.addword_panel.get('boundingBox').one('#verify_def_button');
				var butDiv = this.addword_panel.get('boundingBox').one('.verify_def_div');
				but.on('click',function(e)
				{
					//TODO
					//SimpleAJAXCall('poggle.ajax.php?action=get_definition&word='+addword,handleResponse,'POST','get_definition_add');
					butDiv.setHTML('<div class="redbar"><img src="./images/animated_loading_bar.gif" width=400 height=22 style="border: 0px;"/></div>');

				},this);
				this.definition_panel.on('click',function(e){ if (e.currentTarget) { if (is_word_no_def) { e.preventDefault(); return; } e.currentTarget.hide();  definition_shown=false; } });
				got_start_button = false;
				got_results = false;
				Y.one('#resultGrid').empty();


				var words = global_results['words'];
				var raw_words = global_results['raw_words'];
				var maxword =  '';
				Y.each(raw_words, function(word)
				{
					if (word.length > maxword.length)
					{
						maxword = word;
					}
				});
				this.maxword = maxword
				var total_words = words.length;
				var pointages = this.pointages = global_results['pointages'];
				var playerresjected = global_results['playerrejected'];
				var cont = this.get('container');
				var plid = game.players.self.id
				//console.log('SASFDASF')
				//console.log(playerresjected.toSource())
				this.foundwordlist = result_view = new Y.FoundWordListView({parr:this, letters:this.letters,words:words,current_player:plid,rejected:playerresjected});
				//this.foundwordlist.letters = this.letters
				//console.log('iiiiiiii')
				//console.log(this.foundwordlist.toSource())
				this.foundwordlist.get('container').addClass('results_view');
				this.foundwordlist.set('results',words);
				this.foundwordlist.setPlayer(plid);

				bottompanel = cont.one('#placement_bottompanel_home')

				var cont = this.get('container');
				var uppermessage = Y.Node.create('<div class="playerconsole">Cliques l\'icône à côté de ton nom pour débuter</div>');
				cont.append(uppermessage)
				var results_panel = Y.Node.create('<div id="results_panel"></div>');
				bottompanel.empty()
				bottompanel.append(results_panel)
				cont.one('#results_panel').append(this.foundwordlist.render().get('container'));
				//this.get('container').append(this.foundwordlist.get('container'))

				//cont.one('#results_panel').empty();
				//results_panel.append(this.get('foundwordlist').render().get('container'));

				//scrollpb();
				cont.all('.result_word').on('mouseover',function(e){   if (e.currentTarget) { console.log(e.currentTarget);  if (this) {  this.drawPath(e.currentTarget.getHTML());  }  e.currentTarget.setStyle('backgroundColor','#084B8A'); e.currentTarget.setStyle('color','#ffffff'); } },foundwordlist);
				cont.all('.result_word').on('mouseout',function(e){ if (result_view && result_view.minigrid_graphic) {  result_view.minigrid_graphic.removeAllShapes(); }   var col = 0; if (colorRestore[this.player]!= null) { col = colorRestore[this.player][e.currentTarget.getHTML()]; }   if (col==1) {  e.currentTarget.setStyle('backgroundColor','#00aa00');  e.currentTarget.setStyle('color','#ffffff'); } else if (col==2) {  e.currentTarget.setStyle('backgroundColor','#aa0000');  e.currentTarget.setStyle('color','#ffffff'); }  else {  e.currentTarget.setStyle('backgroundColor','transparent');  e.currentTarget.setStyle('color','#000'); }  },foundwordlist);


				has_results = true;
				rgrid = Y.one('#resultGrid');
				gameboardmini = new Y.GameBoard();
				gameboardmini.renderMini=true;
				gameboardmini.get('container').removeClass('gameboard');
				//app.get('activeView').minigrid = gameboardmini;
				//rgrid.addClass('gameboard_mini');
				if (!this.rgrid_attached)
				{
					console.log('NOT ATTACHED')
					//console.log(gameboardmini.buildBoardMini(this.letters).toSource())
					rgrid.append(gameboardmini.buildBoardMini(this.letters));
					this.rgrid_attached= true;

				} else {
					console.log('ATTACHED')
                	gameboardmini.setLetters(this.letters);
                }
                cont.append(gameboardmini.render().get('container'))

				setTimeout('buildtrophies()',1000)
				setTimeout('setscores()',1000)
				setTimeout('setresultshandlers()',1200)


				//this.buildTrophies()
				//this.chatviewmini.chatentrylist.add(new ChatEntryModel({user:'Info',content:'Bienvenue &agrave; Boggle!'}));


		},
		setScores: function() {

			console.log('WOOOOOT:')
			console.log(this.scores.toSource())
			this.homeheadview.updateScore(this.scores)
			/*for (var i in this.scores) {
				if (this.scores.hasOwnProperty(i)) {
						this.scores[i] = players_
				}
			}*/
		},
		buildTrophies: function() {

			var maxId = 0;
			for (var i in this.pointages) {
				if (this.pointages.hasOwnProperty(i)) {
					if (this.pointages[i]>maxId) {
						maxId = i
					}
				}
			}
			console.log('maxID is:'+maxId)
			console.log(players_info.toSource())
			if (maxId!=0)
				this.winnerName = players_info[maxId]['login_name']

			var resultsDiv = Y.Node.create('<div class="resultsDiv"></div>')

			var contHTML = "<table id='pointagesTable' cellspacing=0 cellpadding=0   width=207 height=162 style=' font-weight:bold;'>"
			var maxId = 0;
			for (var i in this.pointages) {
				if (this.pointages.hasOwnProperty(i)) {
					if (this.pointages[i]>maxId) {
						maxId = i
					}
				}
			}
			for (var i in this.pointages) {

				if (this.pointages.hasOwnProperty(i)) {
					contHTML+="<tr onclick='result_view.setPlayer(this.getElementsByTagName(\"td\")[0].id).render()'>"
					contHTML+="<td align=left id='"+i+"' width=40% style='border-bottom:2px solid #555555; padding-left:8px; color:#c9791e; font-size:20px;'>"
					contHTML+=players_info[i]['login_name']+":"
					contHTML+="</td>"
					contHTML+="<td align=left  width=20% style='border-bottom:2px solid #555555;  padding-left:10px; font-size:23px;'>"
					contHTML+=this.pointages[i]
					contHTML+="</td>"
					if (maxId==i && maxId!=0) {
						contHTML+="<td align=right  width=40% style='border-bottom:2px solid #555555; padding-right:7px;'>"
						contHTML+="<img src='images/trophy_gold.png' style='width:40px; height:40px;'/>"
						contHTML+="</td>"
					} else {
						contHTML+="<td align=right  width=40% style='border-bottom:2px solid #555555; padding-right:7px;'>"
						contHTML+="<img src='images/trans.png' style='width:40px; height:40px;'/>"
						contHTML+="</td>"
					}
					contHTML+="</tr>"
				}

			}
			contHTML+="</table>"
			resultsDiv.setHTML(contHTML)
			this.get('container').append(resultsDiv)

			var chatms = "Égalité, pesonne ne gagne."
			var maxId = 0;
			for (var i in this.pointages) {
				if (this.pointages.hasOwnProperty(i)) {
					if (this.pointages[i]>maxId) {
						maxId = i
					}
				}
			}
			if (maxId!=0) {
				chatms = 'Bravo <span style="font-size:14px; margin-top:4px; color:#c9791e;">'+this.winnerName+'</span>, tu as gagné la partie avec '+this.pointages[maxId]+' points!';
			}
			this.chatviewmini.chatentrylist.add(new ChatEntryModel({user:'Info',content:'<b>'+chatms+'</b>'}));
			this.chatviewmini.chatentrylist.add(new ChatEntryModel({user:'Info',content:'Le mot le plus long était <span style="color:#c9791e">'+this.maxword+'</span>'}))

		},
		addHostToPlayerList: function()
		{
			var thisplayer = this.thisplayer = new Y.Player({id:game.players.self.id,login_name:parrframe.main_instance.login_name});
			this.playerlistview.playerlist.add(thisplayer);

		},
		reinit:function()
		{

		},
		loginOtherPlayer: function(playerid)
		{
			var pl = game.players.others[playerid].login_name


			if (!otherplayermodels[playerid] || otherplayermodels[playerid]==undefined)
			{
				otherplayermodels[playerid] = new Y.Player({id:playerid, login_name:pl});
				if (this.hasResults) {

				} else{
					this.chatview.chatentrylist.add(new ChatEntryModel({user:'Info',content:game.players.others[playerid].login_name+' s\'est joint &agrave; la partie'}));
				}
			}

			this.playerlistview.playerlist.add(otherplayermodels[playerid]);

			if (game.players.self.host || parrframe.main_instance.hosting)
				this.activateGoButton()

			players_info[playerid] = { login_name:pl }
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
			if (this.hasResults) {

			} else {
				this.chatviewmini.chatentrylist.add(new ChatEntryModel({user:'Info',content:oldln+' a quitt&eacute;... En attente d\'un autre adversaire'}));
			}

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
			this.backimg.setStyle('display','none');
			gamestarted = true;
			Y.log('START GAME')
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
			buttonDiv.one('#startbutton').on('mousedown',function(e)
			{

				game.socket.send('c.sg.');
			});
			buttonDiv.one('#startbutton').on('touchstart',function(e)
			{

				game.socket.send('c.sg.');
			});
			leftpanel.append(buttonDiv);


			var bottompanel = Y.Node.create('<div class="placement_bottompanel_home" id="placement_bottompanel_home"></div>');
			if (!this.hasResults) {
				bottompanel.append(this.chatview.render().get('container'));
			} else {
				console.log('blelelele')
				this.get('container').append(this.chatviewmini.render().get('container'));
			}

			submaster.append(leftpanel);
			submaster.append(bottompanel);
			masterdiv.append(submaster)

			this.get('container').append(masterdiv)
			//if (this.solution && Object.keys(this.solution).length !== 0 && Object.getPrototypeOf(this.solution) === Object.prototype) {
			if (this.hasResults) {


			}else {
				console.log('FUCK')
			}

		}
	});

	Y.Game = Y.Base.create('game',Y.View,[],
	{
		clockmodelview:null,
		gameboard:null,
		container: '<div>',
		gameconfig:null,
		message_top_anim:null,
		backimg:null,
		solution:[],
		already_played:false,
		myplayer: {},
		loading_panel: null,
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
			console.log('total players:'+total_players)
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
			 loading_panel = this.loading_panel = new Y.Panel({
			    bodyContent: '<div><img src="images/loading.gif"</div>',
			    width      : 66,
			    zIndex     : 46,
			    centered   : true,
			    modal      : true,
			    render     : '#gameboard',
			    visible    : false

			});
			var c = this.get('container');

			//this.backimg = Y.Node.create('<div style="z-index=1; position:absolute; left:0px; top:0px;"><img src="./images/back_hand.jpg" style="width:1290; height:900px;"/></div>');
            Y.one('#resultGrid').hide();
            currentDuration = '';
			solution_empty = false;
			Y.one('#wrapper').setStyle('backgroundImage','url("images/back3.jpg")');
			colorRestore = { };
			botmsg_received = [];
			var clock = new Y.Clock({timeleft:25,urgent_threshold:11});
			this.clockmodelview = new Y.ClockView({model:clock});
			var container = this.get('container');
			container.append(this.clockmodelview.render().get('container'));

			this.gameboard = new Y.GameBoard();
			this.gameboard.get('container').addClass('gameboard');
			container.append(this.gameboard.render().get('container'));
			container.append(Y.Node.create('<div class="foundwords"><textarea id="mywords" class="foundwords" id="words" cols=24 rows=21></textarea></div>'))

			console.log('sending c.ggi')
			game.socket.send('c.ggi.') // get game info
			Y.one('#draw_mini').hide()
			//container.one('.foundwords').hide()

		},
		setMyplayer : function(pinfo) {
			this.myplayer = pinfo
		},
		parseDefs: function(str) {
			//console.log('parseDEF:'+str)

			if(str && typeof str === 'string') {
			  str = str.replace('periodconv','.')
			  str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
			  str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
			  //element.innerHTML = str;
			  //str = element.textContent;
			  //element.textContent = '';
			}
			return str

		},
		setGameconfig : function(initObj)
		{
			Y.log('woot gameconfig '+initObj.toSource())
			this.gameconfig = new Y.GameConfigView(initObj);
			thisapp.get('activeView').get('container').append(this.gameconfig.render().get('container'));

		},
		startGameRefesh:function(){
			//startGameRefesh();
			if (this.clockmodelview!=undefined)
			{
				this.clockmodelview.decrement();
				if (this.clockmodelview.ended())
				{
					clearTimeout(gamerefreshTO);
					app.navigate('/submit');
					return;
				}
				gamerefreshTO = setTimeout('startgamerefesh()',1000)
			}
		},
		sendEndGame:function()
		{
			console.log('SEND END GAME')
			thisapp.get('activeView').reinit()
			game.socket.send('c.eg.')
		},
		stopGame:function()
		{
				console.log('SEND STOP GAME')
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

	Y.Clock = Y.Base.create('game',Y.Model,[],
	{
		ATTRS:
		{
			timeleft: { value:120 },
			urgent_threshold: { value:0 },
			digitImages: {}
		},
		urgent : false,
		toggleclass: 0,
		endprop: false,
		decrement: function()
		{

			this.set('timeleft',(this.get('timeleft')-1));
		},
		end: function()
		{
			return this.endprop;
		},
		setImages: function(imgs) {
			console.log('setting imgs toL'+imgs.toSource())
			this.digitImages = imgs
		},
		toimg:function()
		{
			console.log('parrr:')
			console.log(digitImages.toSource())
			var outp = ''
			var sec = parseInt(this.get('timeleft'));
			if (sec < this.get('urgent_threshold')) this.urgent=true;
			if (sec<=0) this.endprop = true;
			var min=0;
			while(sec>59){ sec-=60; min++;}
			if (min < 10) min = '0'+min;
			else min=''+min
			if (sec < 10) sec = '0'+sec;
			else sec = ''+sec

			var d = digitImages
			console.log(d.toSource())
			for (var i = 0; i < min.length; i++) {
				outp += '<img src="'+d[min.charAt(i)].src+'"/>';
			}
			outp += '<img src="images/dots.png"/>'
			for (var i = 0; i < sec.length; i++) {
				outp += '<img src="'+d[sec.charAt(i)].src+'"/>';
			}
			return outp
		},
		tostr:function()
		{
			var sec = parseInt(this.get('timeleft'));
			if (sec < this.get('urgent_threshold')) this.urgent=true;
			if (sec<=0) this.endprop = true;
			var min=0;
			while(sec>59){ sec-=60; min++;}
			if (min < 10) min = '0'+min;
			if (sec < 10) sec = '0'+sec;
			return min+':'+sec;
		},
		getSeconds: function(str)
		{
			var seconds = 0;
			var minutes = str.match(/(\d+)\s*:\s*(\d+)/);
			if (minutes) { seconds += parseInt(minutes[1])*60; }
			if (minutes) { seconds += parseInt(minutes[2]); }
			return seconds;
		},
		toggleClass: function()
		{
			var ret = [];
			if (this.toggleclass==1)
			{
				this.toggleclass=0;
				ret.push('counternode_off');
				ret.push('counternode_on');
			}
			else
			{
				this.toggleclass=1;
				ret.push('counternode_on');
				ret.push('counternode_off');
			}
			return ret;
		}
	});
	Y.ClockView = Y.Base.create('game',Y.View,[],
	{
		timenode: null,
		digitImages: {},
		ready: false,
		initializer: function()
		{
			this.preloadImages()


			m = this.get('model');
			m.after('timeleftChange',function(e){ this.render();  },this);
			this.get('container').addClass('counternode');

			var timenode = this.timenode = Y.Node.create('<div id="timenode">');
			timenode.setHTML(m.toimg());
			//this.get('container').append(this.timenode)
			//var dummy = Y.Node.create('<div><img width=40 height=5 src="images/trans.png"/></div>');
			//this.get('container').append(dummy);

			var backclock = new Image()
			backclock.src = 'images/clock.png'
			backclock.id = "backclock"
			backclock.onload = function() {
				thisapp.get('activeView').get('container').append(backclock);
				thisapp.get('activeView').clockmodelview.ready = true
			}
			//this.get('container').append(backclock)
			//this.get('container').append(timenode);
		},
		preloadImages : function() {
			for (var i = 0; i < 10; i++) {
				digitImages[''+i] = new Image();
				digitImages[''+i].src = 'images/d'+''+i+'.jpg';
				//digitImages[i] = { 'a':'test' }
				//console.log(this.digitImages[i].toSource());
			}
			console.log('my images:')
			console.log(digitImages.src)
			//this.get('model').setImages(digitImages)
		},
		render: function()
		{
			if (!this.ready) return this
			m = this.get('model');
			if (m.urgent)
			{
				var cl = m.toggleClass();
				this.get('container').removeClass(cl[1]);
				this.get('container').addClass(cl[0]);
			}
			this.timenode.setHTML(m.toimg());
			thisapp.get('activeView').get('container').append(this.timenode)
			return this;
		},
		decrement: function()
		{
			if (this.ready)
				this.get('model').decrement();
		},
		ended: function()
		{
			return this.get('model').end();
		}
	});
	Y.GameBoard = Y.Base.create('gameBoard',Y.View,[],
	{
		container: '<div/>',
		renderMini: false,
		initializer: function()
		{

		},
		render: function()
		{

			return this;
		},
		getMap: function()
		{
			var ret = [];
            var tops = [79,165,249,336,425];  // +9
            var lefts = [82,170,256,344,427]
			ret[0] = {'left':lefts[0],'top':tops[0]}
			ret[1] = {'left':lefts[1],'top':tops[0]}
			ret[2] = {'left':lefts[2],'top':tops[0]}
			ret[3] = {'left':lefts[3],'top':tops[0]}
			ret[4] = {'left':lefts[4],'top':tops[0]}

			ret[5] = {'left':lefts[0],'top':tops[1]}
			ret[6] = {'left':lefts[1],'top':tops[1]}
			ret[7] = {'left':lefts[2],'top':tops[1]}
			ret[8] = {'left':lefts[3],'top':tops[1]}
			ret[9] = {'left':lefts[4],'top':tops[1]}

			ret[10] = {'left':lefts[0],'top':tops[2]}
			ret[11] = {'left':lefts[1],'top':tops[2]}
			ret[12] = {'left':lefts[2],'top':tops[2]}
			ret[13] = {'left':lefts[3],'top':tops[2]}
			ret[14] = {'left':lefts[4],'top':tops[2]}

			ret[15] = {'left':lefts[0],'top':tops[3]}
			ret[16] = {'left':lefts[1],'top':tops[3]}
			ret[17] = {'left':lefts[2],'top':tops[3]}
			ret[18] = {'left':lefts[3],'top':tops[3]}
			ret[19] = {'left':lefts[4],'top':tops[3]}

			ret[20] = {'left':lefts[0],'top':tops[4]}
			ret[21] = {'left':lefts[1],'top':tops[4]}
			ret[22] = {'left':lefts[2],'top':tops[4]}
			ret[23] = {'left':lefts[3],'top':tops[4]}
			ret[24] = {'left':lefts[4],'top':tops[4]}

			return ret;
		},
		getMapMini: function()
		{
			var ret = [];

			ret[0] = {'left':22 ,'top':20}
			ret[1] = {'left':62 ,'top':20}
			ret[2] = {'left':102 ,'top':20}
			ret[3] = {'left':142,'top':20}
			ret[4] = {'left':182,'top':20}

			ret[5] = {'left':22 ,'top':59}
			ret[6] = {'left':62 ,'top':59}
			ret[7] = {'left':102,'top':59}
			ret[8] = {'left':142,'top':59}
			ret[9] = {'left':182,'top':59}

			ret[10] = {'left':22 ,'top':98}
			ret[11] = {'left':62 ,'top':98}
			ret[12] = {'left':102,'top':98}
			ret[13] = {'left':142,'top':98}
			ret[14] = {'left':182,'top':98}

			ret[15] = {'left':22 ,'top':137}
			ret[16] = {'left':62 ,'top':137}
			ret[17] = {'left':102,'top':137}
			ret[18] = {'left':142,'top':137}
			ret[19] = {'left':182,'top':137}

			ret[20] = {'left':22 ,'top':176}
			ret[21] = {'left':62 ,'top':176}
			ret[22] = {'left':102,'top':176}
			ret[23] = {'left':142,'top':176}
			ret[24] = {'left':182,'top':176}

			return ret;
		},
		buildBoard: function(letters)
		{
		     //       Y.log('in buildboard')
			var node = Y.Node.create('<div/>');
			var lets = new Y.Array(letters);
			var c = 0;
			Y.log('getting map')
			var matrix = this.getMap();
			//Y.log('going thru letters'+lets)
			Y.each(lets,function(letter)
			{
				var inner =  Y.Node.create('<div style=" width:60px; height:60px; position:absolute; top:'+(matrix[c]['top']-57)+'px; left:'+(matrix[c]['left']-4)+'px;">'+letter.toUpperCase()+'</div>');
				node.append(inner);
				c++;
			});
			Y.log('total nodes was '+c+' node was'+node)
			return node;
		},
        setLetters: function(letters)
        {
            var minigrid = Y.one('.minigrid');
            minigrid.empty();
			var lets = new Y.Array(letters);
			var c = 0;
			var matrix = this.getMap();
			Y.each(lets,function(letter)
			{
				var inner =  Y.Node.create('<div id="mini_grid" style=" width:42px; height:42px;  padding-top:5px; text-align:center; position:absolute; font-size:26px; font-weight:bold;  font-family:\'Lucida Console\', Monaco, monospace; border:ridge 2px #dddddd; background-color:#ffffff; top:'+((matrix[c]['top']/2.23)+121)+'px; left:'+((matrix[c]['left']/2.14)+455)+'px;">'+letter.toUpperCase()+'</div>');
				minigrid.append(inner);
				c++;
			});
                },
		buildBoardMini: function(letters)
		{
			//console.log('buildBoardMini')

			var cont = Y.Node.create('<div>');
			var node = Y.Node.create('<div  class="minigrid"/>');
			var lets = new Y.Array(letters);
			var c = 0;
			var matrix = this.getMap();
			Y.each(lets,function(letter)
			{
				//console.log('DOING LETTER:'+letter)
				var inner =  Y.Node.create('<div id="mini_grid" style=" width:42px; height:42px;  padding-top:5px; text-align:center; position:absolute; font-size:26px; font-weight:bold;  font-family:\'Lucida Console\', Monaco, monospace; border:ridge 2px #dddddd; background-color:#ffffff; top:'+((matrix[c]['top']/2.23)+16)+'px; left:'+((matrix[c]['left']/2.14)+525)+'px;">'+letter.toUpperCase()+'</div>');
				node.append(inner);
				c++;
			});
			//console.log(node.toSource())
			cont.append(node);


			//cont.append(Y.Node.create('<div class="toggle_mini_grid"><button class="togglegridbutton">Cacher la grille</button></div>'));
			//node.hide();
			//node.setStyle('opacity','0');
		        anim_close = new Y.Anim({
				node: cont.one('.minigrid'),
				from: { opacity: 1 },
				to: { opacity: 0 },
				duration: 1.0

		   	 });
		        anim_open = new Y.Anim({
				node: cont.one('.minigrid'),
				from: { opacity: 0 },
				to: { opacity: 1 },
				duration: 1.0

		   	 });
		        path_close = new Y.Anim({
				node: Y.one('#draw_mini'),
				from: { opacity: 1 },
				to: { opacity: 0 },
				duration: 1.0

		   	 });
		        path_open = new Y.Anim({
				node: Y.one('#draw_mini'),
				from: { opacity: 0 },
				to: { opacity: 1 },
				duration: 1.0

		   	 });

			//cont.one('.toggle_mini_grid').on('click',function(e) {  if (animtoggle==1) { animtoggle=0; anim_close.run(); path_close.run(); e.currentTarget.get('children').item(0).setHTML('Voir la grille'); } else { animtoggle=1; anim_open.run(); path_open.run(); e.currentTarget.get('children').item(0).setHTML('Cacher la grille'); } });
			return cont;
		}

	});

	Y.PathNode = Y.Base.create('pathNode',Y.Model,[],
	{
		ATTRS:
		{
			lettre:{ value:'' },
			id:{ value:0 },
			voisins: { value:{ } },
			flag: { value: false } ,
		},
		setVoisin: function(nUp,nNE,nRight,nSE,nDown,nSW,nLeft,nNW)
		{
			var temp = { };
			temp['up'] = nUp;
			temp['ne'] = nNE;
			temp['right'] = nRight;
			temp['se'] = nSE;
			temp['down'] = nDown;
			temp['sw'] = nSW;
			temp['left'] = nLeft;
			temp['nw'] = nNW;
			this.set('voisins',temp);
		},

		findWordsHelp: function(word)
		{
			var pathArray = [];
			var currentStr = '';
			return this.find(word,currentStr,0,pathArray);
		},
		find: function(word,currentStr,level,pathArray)
		{
			var n = this.get('voisins');
			currentStr+=this.get('lettre');

			if (word.indexOf(currentStr)!=0) return [];

			level++;
			pathArray.push(this.get('id'));

			if (pathArray.length == word.length) {  return pathArray;  }

			if (n['up'] && !n['up'].get('flag'))
			{
				this.set('flag',true);
				var retarr = n['up'].find(word,currentStr,level,pathArray);
				if (retarr.length==word.length)
				{
					return retarr;
				}
				this.set('flag',false);
			}
			if (n['ne'] && !n['ne'].get('flag'))
			{
				this.set('flag',true);
				var retarr = n['ne'].find(word,currentStr,level,pathArray);
				if (retarr.length==word.length)
				{
					return retarr;
				}
				this.set('flag',false);
			}
			if (n['right'] && !n['right'].get('flag'))
			{
				this.set('flag',true);
				var retarr = n['right'].find(word,currentStr,level,pathArray);
				if (retarr.length==word.length)
				{
					return retarr;
				}
				this.set('flag',false);
			}
			if (n['se'] && !n['se'].get('flag'))
			{
				this.set('flag',true);
				var retarr = n['se'].find(word,currentStr,level,pathArray);
				if (retarr.length==word.length)
				{
					return retarr;
				}
				this.set('flag',false);
			}
			if (n['down'] && !n['down'].get('flag'))
			{
				this.set('flag',true);
				var retarr = n['down'].find(word,currentStr,level,pathArray);
				if (retarr.length==word.length)
				{
					return retarr;
				}
				this.set('flag',false);
			}
			if (n['sw'] && !n['sw'].get('flag'))
			{
				this.set('flag',true);
				var retarr = n['sw'].find(word,currentStr,level,pathArray);
				if (retarr.length==word.length)
				{
					return retarr;
				}
				this.set('flag',false);
			}
			if (n['left'] && !n['left'].get('flag'))
			{
				this.set('flag',true);
				var retarr = n['left'].find(word,currentStr,level,pathArray);
				if (retarr.length==word.length)
				{
					return retarr;
				}
				this.set('flag',false);
			}
			if (n['nw'] && !n['nw'].get('flag'))
			{
				this.set('flag',true);
				var retarr = n['nw'].find(word,currentStr,level,pathArray);
				if (retarr.length==word.length)
				{
					return retarr;
				}
				this.set('flag',false);
			}
			pathArray.pop();
			return [];
		}
	});

	Y.FoundWordListView = Y.Base.create('home',Y.View,[],
	{
		ATTRS:
		{
			current_player: null,
			rejected: { },
			words : null,
			posx: 0,
			posy:0,
			letters:[],
			parr:null,
		},
		maxX:23,
		posxInc: 50,
		posyInc : 50,
		player : '',
		totalWords:0,
		playersWordCount: { },
		minigrid_graphic: null,
		paths: { },

		initNodes:function()
		{
			pathnodes[0].setVoisin(null	   ,null	,pathnodes[1],pathnodes[6],pathnodes[5],null	    ,null	 ,null);
			pathnodes[1].setVoisin(null	   ,null	,pathnodes[2],pathnodes[7],pathnodes[6],pathnodes[5],pathnodes[0],null);
			pathnodes[2].setVoisin(null	   ,null	,pathnodes[3],pathnodes[8],pathnodes[7],pathnodes[6],pathnodes[1],null);
			pathnodes[3].setVoisin(null	   ,null	,pathnodes[4],pathnodes[9],pathnodes[8],pathnodes[7],pathnodes[2],null);
			pathnodes[4].setVoisin(null	   ,null	,null	     ,null	  ,pathnodes[9],pathnodes[8],pathnodes[3],null);

			pathnodes[5].setVoisin(pathnodes[0],pathnodes[1],pathnodes[6],pathnodes[11],pathnodes[10],null	       ,null	    ,null);
			pathnodes[6].setVoisin(pathnodes[1],pathnodes[2],pathnodes[7],pathnodes[12],pathnodes[11],pathnodes[10],pathnodes[5],pathnodes[0]);
			pathnodes[7].setVoisin(pathnodes[2],pathnodes[3],pathnodes[8],pathnodes[13],pathnodes[12],pathnodes[11],pathnodes[6],pathnodes[1]);
			pathnodes[8].setVoisin(pathnodes[3],pathnodes[4],pathnodes[9],pathnodes[14],pathnodes[13],pathnodes[12],pathnodes[7],pathnodes[2]);
			pathnodes[9].setVoisin(pathnodes[4],null	,null	     ,null	   ,pathnodes[14],pathnodes[13],pathnodes[8],pathnodes[3]);

			pathnodes[10].setVoisin(pathnodes[5],pathnodes[6],pathnodes[11],pathnodes[16],pathnodes[15],null,null,null);
			pathnodes[11].setVoisin(pathnodes[6],pathnodes[7],pathnodes[12],pathnodes[17],pathnodes[16],pathnodes[15],pathnodes[10],pathnodes[5]);
			pathnodes[12].setVoisin(pathnodes[7],pathnodes[8],pathnodes[13],pathnodes[18],pathnodes[17],pathnodes[16],pathnodes[11],pathnodes[6]);
			pathnodes[13].setVoisin(pathnodes[8],pathnodes[9],pathnodes[14],pathnodes[19],pathnodes[18],pathnodes[17],pathnodes[12],pathnodes[7]);
			pathnodes[14].setVoisin(pathnodes[9],null	 ,null	       ,null	     ,pathnodes[19],pathnodes[18],pathnodes[13],pathnodes[8]);

			pathnodes[15].setVoisin(pathnodes[10],pathnodes[11],pathnodes[16],pathnodes[21],pathnodes[20],null	   ,null	 ,null);
			pathnodes[16].setVoisin(pathnodes[11],pathnodes[12],pathnodes[17],pathnodes[22],pathnodes[21],pathnodes[20],pathnodes[15],pathnodes[10]);
			pathnodes[17].setVoisin(pathnodes[12],pathnodes[13],pathnodes[18],pathnodes[23],pathnodes[22],pathnodes[21],pathnodes[16],pathnodes[11]);
			pathnodes[18].setVoisin(pathnodes[13],pathnodes[14],pathnodes[19],pathnodes[24],pathnodes[23],pathnodes[22],pathnodes[17],pathnodes[12]);
			pathnodes[19].setVoisin(pathnodes[14],null	   ,null	 ,null	       ,pathnodes[24],pathnodes[23],pathnodes[18],pathnodes[13]);

			pathnodes[20].setVoisin(pathnodes[15],pathnodes[16],pathnodes[21],null	       ,null	     ,null	   ,null	 ,null);
			pathnodes[21].setVoisin(pathnodes[16],pathnodes[17],pathnodes[22],null	       ,null	     ,null	   ,pathnodes[20],pathnodes[15]);
			pathnodes[22].setVoisin(pathnodes[17],pathnodes[18],pathnodes[23],null	       ,null	     ,null	   ,pathnodes[21],pathnodes[16]);
			pathnodes[23].setVoisin(pathnodes[18],pathnodes[19],pathnodes[24],null	       ,null	     ,null	   ,pathnodes[22],pathnodes[17]);
			pathnodes[24].setVoisin(pathnodes[19],null	   ,null	 ,null	       ,null	     ,null	   ,pathnodes[23],pathnodes[18]);

		},
		findHelper: function(word)
		{
			var mletters = this.get('letters')
			//console.log(mletters.toSource())
			for (var i = 0 ; i < mletters.length ; i++)
			{
				pathnodes[i] = new Y.PathNode({lettre:mletters[i],id:i,voisins: { }, flag:false });
			}
			this.initNodes();

			for (var i = 0 ; i < pathnodes.length ; i++)
			{
				var ret = pathnodes[i].findWordsHelp(word);

				if (ret.length==word.length)
				{
					return ret;
				}
			}
			return [];

		},
		initializer: function()
		{
			this.after('posxChange',this.checkLimits,this);
			var words = this.get('words');
			var keys = [];
			for(var propt in words){
				if (propt!='toSource')
				{
					keys.push(propt);
				}
			}
			for (var i = 0 ; i < keys.length ; i++)
			{
				this.paths[keys[i]] = this.findHelper(keys[i]);
			}
			this.totalWords = keys.length;

			if (this.minigrid_graphic==null)
			{
				this.minigrid_graphic = new Y.Graphic({render: '#draw_mini'})
			}

		},
		setPlayer: function(id)
		{
			if (!id || id=='') return this;
			this.get('container').empty();

			this.player=id;
			console.log('SET PLAYER:'+this.player)
			return this;
		},
		checkLimits: function()
		{
			var posx=this.get('posx');
			var posy=this.get('posy');
			if (posx>100)
			{
				posx = 0;
				posy+=this.posyInc;
			}
			this.set('posx',posx);
			this.set('posy',posy);
		},
		nextSpace: function(w)
		{
			var new_length = this.get('posx')+w.length;

			if (new_length>this.maxX)
			{
				var posy=this.get('posy');
				posy+=this.posyInc;
				this.set('posy',posy);
				this.set('posx',0);
			}
			else
				this.set('posx',this.get('posx')+w.length);
		},
		drawPath: function(word)
		{
			if (word.length<=0) return;
			var gb = new Y.GameBoard();
			var map = gb.getMapMini();


			var path = this.paths[word];
			if (path==null || path==undefined) return;

			this.minigrid_graphic.removeAllShapes();


			var connector = this.minigrid_graphic.addShape({
				type: "path",
				stroke: {
				    weight: 7,
				    color: "#FFA500",
				    opacity: 0.7,
				   // linejoint: 'bevel',
				    //dashstyle: [10, 4]
				}
			    });

			//var startnode = this.minigrid_graphic.addShape(startShape);

			for (var i = 0 ; i < path.length ; i++)
			{
				if (i==0)
				{

					connector.moveTo(map[path[i]]['left'],map[path[i]]['top']);
				}
				if (map[path[(i+1)]]!=null)
				{

					connector.lineTo(map[path[(i+1)]]['left'],map[path[(i+1)]]['top']);
				}
				else
					connector.end();
			}

			//var endnode = this.minigrid_graphic.addShape(endShape);


		},
		render: function()
		{
			this.playersWordCount = {};
			var c = this.get('container');
			this.set('posx',0);
			this.set('posy',0);

			var words = this.get('words');
			var rejected = this.get('rejected');
			console.log('EEEEEEEEE')
			console.log(rejected.toSource())
			var keys = [];

			for(var propt in words){
				if (propt!='toSource')
					keys.push(propt);
			}





			//keys.sort(function(a, b){return a.length - b.length; });
			keys.sort();

			this.totalWords = keys.length;

			var rej = rejected[this.player];

			var didnt_play = false;
			if ((rej==null || rej=='undefined') && !solution_empty)
			{
				var player_name = loginname_ById[this.player];
				var playerconsole = app.get('activeView').get('container').one('.playerconsole');
				playerconsole.setHTML(player_name+' n\'a pas joué.');
				didnt_play = true;
			}


			for(var i = 0 ; i < keys.length ; i++){
				var py = this.get('posy');
				this.nextSpace(keys[i]);
				var py2 = this.get('posy');
				var wordNode = Y.Node.create('<div class="result_word">'+keys[i]+'</div>');

				wordNode.on('click',function(e)
				{

					var target = e.currentTarget;
					if (!target.hasClass('result_word_invalid'))
					{
						definition_shown = true;
						var cont = app.get('activeView').definition_panel;
						var fc = getFromCache(target.getHTML());
						if (fc['definfo']!=null)
						{
							var cont = app.get('activeView').definition_panel;
							cont.set('bodyContent',app.get('activeView').buildDefinition(fc['definfo'],fc['word']));
							cont.show();
						}
						else
						{
							cont.show();
							cont.set('bodyContent','<div class="redbar"><img src="animated_loading_bar.gif" width=400 height=22 style="border: 0px;"/></div><div class="admin_dc" style="margin-left:14px;">Recherche de la définition du mot '+target.getHTML()+'...</div>');
							//var url = 'http://www.linternaute.com/dictionnaire/fr/definition/'+target.getHTML()+'/';
							//window.open(url,"_blank","toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes, width=1000, height=800")
	   						//SimpleAJAXCall('poggle.ajax.php?action=get_definition&word='+target.getHTML(),handleResponse,'POST','get_definition');
							var data = { 'action':'get_definition' , 'word':target.getHTML() }
							Y.io('poggle.ajax.php', {
								method: 'POST',
								data: data,
								on: {
									success: handleGetDefinition
								}
							});
						}
						//result_view.drawPath(target.getHTML());
					}


				});
				wordNode.on('mouseover',function(e){   if (e.currentTarget) { if (this) { /* console.log(e.currentTarget.getHTML()); */ this.drawPath(e.currentTarget.getHTML());  }  e.currentTarget.setStyle('backgroundColor','#084B8A'); e.currentTarget.setStyle('color','#ffffff'); } },this);
				wordNode.on('mouseout',function(e){ if (result_view && result_view.minigrid_graphic) {  result_view.minigrid_graphic.removeAllShapes(); }   var col = 0; if (colorRestore[this.player]!= null) { col = colorRestore[this.player][e.currentTarget.getHTML()]; }   if (col==1) {  e.currentTarget.setStyle('backgroundColor','#00aa00');  e.currentTarget.setStyle('color','#ffffff'); } else if (col==2) {  e.currentTarget.setStyle('backgroundColor','#aa0000');  e.currentTarget.setStyle('color','#ffffff'); }  else {  e.currentTarget.setStyle('backgroundColor','transparent');  e.currentTarget.setStyle('color','#000'); }  },this);

				if (py2!=py)
				{
					wordNode.addClass('result_word_float_line');
					var bidon = Y.Node.create('<div/>');
					bidon.addClass('result_word_end_line');
					c.append(bidon);
				}
				else
				{
					wordNode.addClass('result_word_float_line');
				}
				if (!didnt_play && inArray(this.player,words[keys[i]]))
				{
					wordNode.addClass('result_word_found');
					if (colorRestore[this.player]==null || colorRestore[this.player]==undefined)
					{
						colorRestore[this.player]= { }
					}
					colorRestore[this.player][keys[i]]=1;
					if (!this.playersWordCount[this.player])
					{
						this.playersWordCount[this.player] = 0;
					}
					this.playersWordCount[this.player]++;
				}
				c.append(wordNode);
			}
			var rej = rejected[this.player];
			console.log('JPJPJPPJJ')
			console.log(rej.toSource())
			/*if (rej==null || rej=='undefined')
			{
				var player name = loginname_ById[this.player];
				var playerconsole = app.get('activeView').get('container').one('.playerconsole');
				playerconsole.setHTML(player name+' n\'a pas joué au dernier tour.');
			}*/
			if (!didnt_play && !solution_empty) rej.sort();

			if (!didnt_play && !solution_empty)
			{

				for (var i = 0 ; i < rej.length ; i++)
				{
					if (rej[i].length<3) continue;
					var py = this.get('posy');
					this.nextSpace(rej[i]);
					var py2 = this.get('posy');
					var wordNode = Y.Node.create('<div class="result_word">'+rej[i]+'</div>');
					wordNode.on('click',function(e)
					{
						if (playerInfo['is_admin']==1)
						{

							var cont = app.get('activeView').addword_panel;

							addword=e.currentTarget.getHTML();
							cont.get('boundingBox').one('#pass_input_add').on('keypress',function(e) { if (e.keyCode === 13){ app.get('activeView').verifyPasswordAdd(); } });
							cont.set('headerContent','<span style="font-size:18px; font-weight:bold;">Ajouter le mot <span style="font-size:20px; color:#FFA500">'+addword+'</span></span>');
							//cont.get('bodyContent').append(Y.Node.create('<div class="verify_def_div"><label for"verify_def_button">Vérifier si je peux trouver une définition><button id="verify_def_button">Vérifier</button></div>'));
							cont.show();

						}


					})
					if (py2!=py)
					{
						wordNode.addClass('result_word_float_line');
						var bidon = Y.Node.create('<div/>');
						bidon.addClass('result_word_end_line');
						c.append(bidon);
					}
					else
					{
						wordNode.addClass('result_word_float_line');
					}
					wordNode.addClass('result_word_notfound');
					if (colorRestore[this.player]==null || colorRestore[this.player]==undefined)
					{
						colorRestore[this.player]= { }
					}
					colorRestore[this.player][rej[i]]=2;
					c.append(wordNode);

				}
			}


			var playerconsole = this.get('parr').get('container').one('.playerconsole');
			if (!solution_empty)
				playerconsole.setStyle('fontSize','20px');
			//playerconsole.setStyle('borderBottom','ridge 2px #bbbbbb');

			var totplayer = this.playersWordCount[this.player];
			if (!totplayer || totplayer=='undefined') totplayer=0;
			if (!didnt_play && !solution_empty)
			playerconsole.setHTML('<div style="float:left">Mots de <span style="color:#a37602; font-weight:bold">'+players_info[this.player]['login_name']+'</span></div><div style="margin-right:10px; width:355px; text-align:right;">'+totplayer+'/'+this.totalWords+'</div>');

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

		thisapp.route('/submit', function () {
			var textarea = thisapp.get('activeView').get('container').one('#mywords');
			var val = textarea.get('value');
			val = val.split("\n").join(",");
			if (val=="" || val==",") {
				val= []
			}
			var ret = {'words':val }
			//console.log('MAINNNNN:')
			//console.log(parrframe.main_instance.main_core)
			console.log(thisapp.get('activeView').myplayer.toSource())
			game.socket.send('c.submit.'+JSON.stringify(ret))
			//var data = {'action':'submit','words':val}
			fin_confirm_panel = new Y.Panel({
				bodyContent: '<div class="temps_ecoule" align=center>Le temps est écoulé</div>',
				width      : 300,
				zIndex     : 117,
				centered   : true,
				modal      : true,
				render     : '#wrapper'
			});
			setTimeout('fin_confirm_panel.hide(); thisapp.get("activeView").loading_panel.show() /*thisapp.navigate(\'/\'); startendgame(); */ ',3000);

		});
		thisapp.navigate('/');


		/////// FUNCTIONS ///////
		players_Info = players_info
		/*function startEndGame() {
			var tot = Y.JSON.parse(response.responseText);
			console.log('-----')
			console.log(tot)
			console.log(
		}*/

		function startGameRefesh()
		{
			if (thisapp.get('activeView').clockmodelview!=undefined)
			{
				thisapp.get('activeView').clockmodelview.decrement();
				if (thisapp.get('activeView').clockmodelview.ended())
				{
					clearTimeout(gamerefreshTO);
					thisapp.navigate('/submit');
					return;
				}
				gamerefreshTO = setTimeout('startgamerefesh()',1000)
			}
		}

		function setResultsHandlers() {

			thisapp.get('activeView').setResultsHandlers()
		}
		function buildTrophies(pointages) {
			thisapp.get('activeView').buildTrophies()
		}
		function startEndGame(points)
		{
			//var ret = { 'thisplayer':players}

			var pointages = JSON.parse(points)
			console.log('pointages!!!!!!!!!!!!!!')
			console.log(pointages)
			console.log(thisapp.get('activeView').playerlistview)
                                //if (foundwordlist && foundwordlist.minigrid_graphic)
			             //foundwordlist.minigrid_graphic.removeAllShapes();
		}

		function setScores() {
			thisapp.get('activeView').setScores()

		}
		startgamerefesh = startGameRefesh;
		startendgame = startEndGame
		setresultshandlers = setResultsHandlers
		buildtrophies = buildTrophies
		setscores = setScores
	}
	GameApp = gameapp;

}, '1.0', {requires: ['chat','playerlist','gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});

