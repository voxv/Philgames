var parrframe = parent;
var game_core = function(){

    this.players = {
        self : new game_player(this),
        others : { }
    };
};

if( 'undefined' != typeof global ) {
    module.exports = global.game_core = game_core;
}

var game_player = function( game_instance, player_instance ) {

    this.instance = player_instance;
    this.game = game_instance;
    this.id = '';
    this.login_name = '';
    this.host=false;
    this.score=0;
};

game_core.prototype.onUpdatePlayerInfo = function(totinfo)
{
	if (totinfo['id']==game.players.self.id)
	{
		game.players.self.id = totinfo['id']
		game.players.self.login_name = totinfo['login_name']
		players_info[game.players.self.id] = {'login_name':game.players.self.login_name }
	}
	else
	{
		if (!game.players.others[totinfo['id']] || game.players.others[totinfo['id']]==undefined)
		{
			game.players.others[totinfo['id']] = new game_player()
		}
		game.players.others[totinfo['id']].id = totinfo['id']
		game.players.others[totinfo['id']].login_name = totinfo['login_name']
		players_info[game.players.others[totinfo['id']].id] = {'login_name':game.players.others[totinfo['id']].login_name }

	}
	//console.log('UUUPI:')
	//console.log(players_Info.toSource())
}
game_core.prototype.client_onjoingame = function(data) {

    this.players.self.host = false;
};

game_core.prototype.client_onhostgame = function(data) {

    this.players.self.host = true;

};
game_core.prototype.client_onstartgame = function(data) {

    thisapp.get('activeView').startGame(data);   // player order is passed
   // checkothermovesTO = setInterval('processmoveopponent()',4)
};

game_core.prototype.client_ongetpionmoved = function(data) {

	pionsqueue.enqueue(data)
};

game_core.prototype.client_onwin = function(data) {

	if (game.players.self.host)
	{
		if (data)
			thisapp.get('activeView').playWinGame();
		else
			thisapp.get('activeView').playLoseGame();
	}
	else
	{
		if (!data)
			thisapp.get('activeView').playWinGame();
		else
			thisapp.get('activeView').playLoseGame();
	}
};
game_core.prototype.client_ongetscores = function(score_clients)
{
	//console.log('received:'+score_clients.toSource())
	for (var i in score_clients)
	{
		if (score_clients.hasOwnProperty(i))
		{
			if (i==game.players.self.id){
				game.players.self.score = score_clients[i]
				console.log('Setting player '+i+' (me) score to :'+game.players.self.score)
			} else
			{
				if (game.players.others[i]==undefined)
				{
					var newplayer = new game_player()
					newplayer.id = i
					//newplayer.login_name = vv['login_name']
					this.players.others[newplayer.id]  = newplayer
					console.log('BIG fuck')
				}
				game.players.others[i].score = score_clients[i]
				console.log('Setting player '+i+' (other) score to :'+game.players.others[i].score)
			}
		}
	}
	//console.log('got scores me ('+game.players.self.id+') :'+game.players.self.score+' others:'+game.players.others.toSource())
	thisapp.get('activeView').updateScore();
}

game_core.prototype.client_onlogin = function(data)
{

		if (thisapp.get('activeView').loginOtherPlayer == undefined) return;

		var vv = JSON.parse(data)

		if (players_info[vv['id']]==undefined)
		{
			var newplayer = new game_player()
			newplayer.id = vv['id']
			newplayer.login_name = vv['login_name']
			this.players.others[newplayer.id]  = newplayer
			players_info[newplayer.id] = {'login_name':newplayer.login_name}
console.log('MY LOGIN NAME:')
console.log(players_info)
			thisapp.get('activeView').loginOtherPlayer(newplayer.id);
		}
		else
		{
			this.players.others[vv['id']].id = vv['id']
			this.players.others[vv['id']].login_name = vv['login_name']
			players_info[vv['id']] = {'login_name':vv['login_name']}

			thisapp.get('activeView').loginOtherPlayer(vv['id']);
		}
		game.socket.send('c.sc.')

}

game_core.prototype.client_onloginmultiple = function(data)
{
		var d = JSON.parse(data)

		var hostinfo = d['host']
		var clientsinfo = d['clients']

		if (thisapp.get('activeView').loginOtherPlayer == undefined) return;

		var newplayer = new game_player()
		newplayer.id = hostinfo['id']
		newplayer.login_name = hostinfo['login_name']
		this.players.others[newplayer.id] = newplayer
		this.players.others[newplayer.id].host=true
		players_info[newplayer.id] = {'login_name':newplayer.login_name}
		thisapp.get('activeView').loginOtherPlayer(newplayer.id);

		//console.log('remaining clients to log:'+clientsinfo.toSource())
		for (var i in clientsinfo)
		{
			if (clientsinfo.hasOwnProperty(i))
			{
				var newplayer = new game_player()
				newplayer.id = clientsinfo[i]['id']
				newplayer.login_name = clientsinfo[i]['login_name']
				this.players.others[newplayer.id] = newplayer

				players_info[newplayer.id] = {'login_name':newplayer.login_name}
				thisapp.get('activeView').loginOtherPlayer(newplayer.id);
			}
		}
		game.socket.send('c.sc.')
		//thisapp.get('activeView').loginOtherPlayer();
}

game_core.prototype.client_ondisconnect = function(cid,newhost) {

	if (checkothermovesTO)
		clearInterval(checkothermovesTO)
	if (gamestarted)
		thisapp.get('activeView').stopGame();

	if (thisapp.get('activeView').removeOtherPlayer)
    	thisapp.get('activeView').removeOtherPlayer(cid);

    if (newhost==game.players.self.id) game.players.self.host = true
    else game.players.self.host = false

    if (!game.players.self.host)
    {
		for (var i in game.players.others)
		{
			if (game.players.others.hasOwnProperty(i))
			{
				if (i==newhost)
				{
					game.players.others[i].host = true
				}
				else
				{
					game.players.others[i].host = false
				}
			}

		}
	}


};


game_core.prototype.client_connect_to_server = function(login_name) {

        var parr = this;
        this.socket = parrframe.main_instance.socket;

		if (!parrframe.main_instance.reconnected)
		{
			if (parrframe.main_instance.subscribedTo!='' && parrframe.main_instance.subscribedTo!=GAME_NAME)
				this.socket.emit('unsubscribe',parrframe.main_instance.subscribedTo);
			this.socket.emit('subscribe',GAME_NAME)
			parrframe.main_instance.subscribedTo=GAME_NAME
		}

		this.socket.removeAllListeners("message");
        this.socket.on('message', function(data){

			var commands = data.split('.');
			var command = commands[0];
			var subcommand = commands[1] || null;
			var commanddata = commands[2] || null;
			//console.log('GOT: '+subcommand+' -> '+commanddata)
			switch(command) {
				case 's': //server message

					switch(subcommand) {

						case 'h' : //host a game requested
							parr.client_onhostgame(commanddata); break;
						case 'j' : //join a game requested
							parr.client_onjoingame(commanddata); break;
						case 'e' : //end game requested
							var tot = JSON.parse(commanddata)
							parr.client_ondisconnect(tot['id_dc'],tot['newhost']); break;
						case 'l' : // notify login

							parr.client_onlogin(commanddata); break;
						case 'lm' : // notify login multiple   { 'host': { id:xxx ,login_name:xxx } , clients { clientid :  { id:xxx ,login_name:xxx }, clientid :  { id:xxx ,login_name:xxx } }
							parr.client_onloginmultiple(commanddata); break;
						case 'iw' :   // win result (data==1 means host won)
							parr.client_onwin(commanddata); break;
						case 'sc' : // get scores
							var scores = JSON.parse(commanddata)
							console.log('SCORES:')
							console.log(scores)
							parr.client_ongetscores(scores); break;
						case 'sg' :   // start game
							parr.client_onstartgame(commanddata); break;
						case 'upi' :    // update player infos
							//console.log('UPDATE PLAYER INFO:'+commanddata)
							parr.onUpdatePlayerInfo(JSON.parse(commanddata))
							break
						case 'lb' :   // loop back - host is back home  , client can go on too
							parrframe.main_instance.hosting = true;
							parrframe.main_instance.reconnected = true;
							if (checkothermovesTO) clearInterval(checkothermovesTO)
							parrframe.app.get('activeView').setGame(GAME_NAME,parrframe.main_instance.activeGame);
							break;
						case 'hl' :    // host loop back (go to home)
							parrframe.main_instance.reconnected = true;
							//if (checkothermovesTO) clearInterval(checkothermovesTO)
							parrframe.app.get('activeView').setGame(GAME_NAME,parrframe.main_instance.activeGame);
							//console.log('host is back home. pointages is:')
							//console.log(pointage_calculated)
							break;
						case 'cm' :   // chat message
							var aa = commanddata.split('||||');
							var username = aa[0]
							var contentmsg = aa[1]
							thisapp.get('activeView').setChatMsg(contentmsg,username)

							break;
						case 'iw' :   // win result (data==1 means host won)
							parr.client_onwin(commanddata); break;
						case 'cm' :
							var aa = commanddata.split('||||');

							var username = aa[0]
							var contentmsg = aa[1]
							//alert(commanddata)
							thisapp.get('activeView').setChatMsg(contentmsg, username)
							//thisapp.get('activeView').chatview.chatentrylist.add(new ChatEntryModel({user:username,content:decodeURIComponent(contentmsg)}));
							//this.get('container').one('.chatpanel_back').set('scrollTop',this.get('container').one('.chatpanel_back').get('scrollHeight'));
							break;
						case 'hid':   // get my pplayer id
							//parrframe.main_instance.hosting = true;
							game.players.self.id = commanddata
							players_info[game.players.self.id] = {'login_name':game.players.self.login_name}
							game.socket.send('c.gpi.'+game.players.self.id)
							thisapp.get('activeView').addHostToPlayerList()
							//thisapp.get('activeView').setMyplayer({ "id":game.players.self.id,"login":game.players.self.login_name })
							break


						case 'win':
							playerwon = commanddata
							thisapp.showView('gamefinish')
							break

						case 'ggi':   // get game info

							rgrid_attached= false;
							var tot = JSON.parse(commanddata)
							//console.log(tot)
							var duration = tot['gameduration'];
							var minletters = tot['minletters'];
							letters = tot['letters']
							thisapp.get('activeView').letters = letters
							console.log('got ggi: '+tot.toSource())
							//thisapp.get('activeView').setGameconfig({is_admin:game.players.self.host,show_full:false,minletters:minletters,duration:duration})

							var clock = thisapp.get('activeView').clockmodelview.get('model');
							var gtime = GAMETIME;


							var gameboard = thisapp.get('activeView').gameboard;
							var n = gameboard.buildBoard(letters);

							thisapp.get('activeView').get('container').one('.gameboard').append(n);
							if (tot['gameduration'])
								gtime = tot['gameduration'];
							thisapp.get('activeView').startGameRefesh();
							console.log(thisapp.get('activeView').get('container').one('.foundwords'))
							thisapp.get('activeView').get('container').one('#mywords').focus();
							//setTimeout("console.log(thisapp.get('activeView').get('container').one('.foundwords')); thisapp.get('activeView').get('container').one('.foundwords').focus();",1000);
							if (game.players.self.host)
							{
								//console.log('sending cls:'+JSON.stringify(tot))
								game.socket.send('c.cls.'+JSON.stringify(tot))  // calculate solution
							}
							break

						case 'cls':  // calc solution
							//console.log('got cls:')
							thisapp.get('activeView').set('solution',commanddata)
							//console.log(thisapp.get('activeView').get('solution'))
							break
						case 'submit':
							thisapp.loading_panel.show()
							break;
						case 'pointage':
							//console.log('P!:'+commanddata)
							//setTimeout('console.log("okkkk"); startendgame('+commanddata+')',2000);
							//pointage_calculated = commanddata
							//console.log('POINTSSS:')
							//console.log(pointage_calculated)
						/*	if (!game.players.self.host){
								thisapp.navigate('/');
							}*/
							gamerestarted = true;
							parent.main_instance.socket.send('c.eg.');
							setTimeout('parent.main_instance.socket.send(\'c.eg.\'); ',1000)

							parrframe.main_instance.reconnected = true;

							break;
						case 'pointages':
							//console.log('POINTSSS FROM HOE:')
							//console.log(JSON.parse(commanddata))
							r = JSON.parse(commanddata)
							thisapp.get('activeView').solution = r['solution']
							thisapp.get('activeView').letters = r['letters']
							thisapp.get('activeView').scores = r['scores']
							//console.log('APP SOLUTION:')
							//console.log(thisapp.get('activeView').solution)
							thisapp.get('activeView').showResults()
							//console.log(players_Info.toSource())
							break;
						case 'definitionsDone':
							commanddata = thisapp.get('activeView').parseDefs(commanddata)
							var defs = JSON.parse(commanddata);
							console.log('YEAHHH :')
							console.log(defs)
							break;
					}
				break;
			}
    	});
};


