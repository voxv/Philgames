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
    this.color = 0;
    this.pre_played = 0;
    this.pre_elimine = 0
    this.game_won = 0
};

game_core.prototype.onUpdatePlayerInfo = function(totinfo)
{
	if (totinfo['id']==game.players.self.id)
	{
		game.players.self.id = totinfo['id']
		game.players.self.color = totinfo['color']
		game.players.self.pre_played = totinfo['pre_played']
		game.players.self.pre_elimine = totinfo['pre_elimine']
		game.players.self.game_won = totinfo['game_won']
		game.players.self.login_name = totinfo['login_name']
		players_info[game.players.self.id] = {'login_name':game.players.self.login_name, 'color':game.players.self.color, 'pre_elimine':game.players.self.pre_elimine, 'pre_played':game.players.self.pre_played, 'game_won':game.players.self.game_won }
	}
	else
	{
		if (!game.players.others[totinfo['id']] || game.players.others[totinfo['id']]==undefined)
		{
			game.players.others[totinfo['id']] = new game_player()
		}
		game.players.others[totinfo['id']].id = totinfo['id']
		game.players.others[totinfo['id']].color = totinfo['color']
		game.players.others[totinfo['id']].pre_played = totinfo['pre_played']
		game.players.others[totinfo['id']].pre_elimine = totinfo['pre_elimine']
		game.players.others[totinfo['id']].game_won = totinfo['game_won']	
		game.players.others[totinfo['id']].login_name = totinfo['login_name']	
		players_info[game.players.others[totinfo['id']].id] = {'login_name':game.players.others[totinfo['id']].login_name, 'color':game.players.others[totinfo['id']].color, 'pre_elimine':game.players.others[totinfo['id']].pre_elimine, 'pre_played':game.players.others[totinfo['id']].pre_played, 'game_won':game.players.others[totinfo['id']].game_won }
		
	}
	if (thisapp.get('activeView').updatePlayerColor)
		thisapp.get('activeView').updatePlayerColor(totinfo['id'],totinfo['color'])
}
game_core.prototype.client_onjoingame = function(data) {

    this.players.self.host = false;
};

game_core.prototype.client_onhostgame = function(data) {

    this.players.self.host = true;

};
game_core.prototype.client_onstartgame = function(data) {

    thisapp.get('activeView').startGame(data);   // player order is passed
    checkothermovesTO = setInterval('processmoveopponent()',4)
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
			if (i==game.players.self.id)
				game.players.self.score = score_clients[i]
			else
			{
				if (game.players.others[i]==undefined)
				{
					var newplayer = new game_player()
					newplayer.id = i
					//newplayer.login_name = vv['login_name']
					this.players.others[newplayer.id]  = newplayer
				}
				game.players.others[i].score = score_clients[i]
				//console.log('Setting player '+i+' score to :'+game.players.others[i].score)
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
			newplayer.color = vv['color']
			this.players.others[newplayer.id]  = newplayer
			players_info[newplayer.id] = {'login_name':newplayer.login_name, 'color':vv['color']}
			
			thisapp.get('activeView').loginOtherPlayer(newplayer.id);
		}
		else
		{
			this.players.others[vv['id']].id = vv['id']
			this.players.others[vv['id']].login_name = vv['login_name']
			this.players.others[vv['id']].color = vv['color']
			players_info[vv['id']] = {'login_name':vv['login_name'], 'color':vv['color']}	
		
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
		newplayer.color = hostinfo['color']
		this.players.others[newplayer.id] = newplayer
		this.players.others[newplayer.id].host=true
		players_info[newplayer.id] = {'login_name':newplayer.login_name, 'color':newplayer.color}
		thisapp.get('activeView').loginOtherPlayer(newplayer.id);

		//console.log('remaining clients to log:'+clientsinfo.toSource())
		for (var i in clientsinfo)
		{
			if (clientsinfo.hasOwnProperty(i))
			{
				var newplayer = new game_player()
				newplayer.id = clientsinfo[i]['id']
				newplayer.login_name = clientsinfo[i]['login_name']
				newplayer.color = clientsinfo[i]['color']
				this.players.others[newplayer.id] = newplayer
				
				players_info[newplayer.id] = {'login_name':newplayer.login_name, 'color':newplayer.color}
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
							if (checkothermovesTO) clearInterval(checkothermovesTO)
							parrframe.app.get('activeView').setGame(GAME_NAME,parrframe.main_instance.activeGame);
							break;
						case 'cm' :   // chat message
							var aa = commanddata.split('||||');
							var username = aa[0]
							var contentmsg = aa[1]
							thisapp.get('activeView').chatview.chatentrylist.add(new ChatEntryModel({user:username,content:decodeURIComponent(contentmsg)}));
							break;
						case 'iw' :   // win result (data==1 means host won)
							parr.client_onwin(commanddata); break;

						case 'hid':   // get my pplayer id
							//parrframe.main_instance.hosting = true;
							game.players.self.id = commanddata
							players_info[game.players.self.id] = {'login_name':game.players.self.login_name}
							game.socket.send('c.gpi.'+game.players.self.id)
							thisapp.get('activeView').addHostToPlayerList()
							break


						case 'ct':    //change turn
							
							var newturn = commanddata
							currentTurn = newturn
							//console.log('new turn:'+currentTurn+' myid:'+game.players.self.id)
							if (newturn==game.players.self.id)
							{
								myturn = true
								if (is_pre)
									thisapp.get('activeView').say('C\'est ton tour')
								possible_moves = {}	
								popitblock=false
							}
							else
							{
								myturn = false
								if (is_pre)
								thisapp.get('activeView').say('C\'est au tour de '+players_info[newturn]['login_name'])
								popitblock = true;
								
							}
							is_in_anim = false
							thisapp.get('activeView').turnshowview.render();
							
							break

						case 'win':
							playerwon = commanddata
							thisapp.showView('gamefinish')
							break
							
						case 'stm': //show start message
							
							turnshowupdate_lock = 1
							thisapp.get('activeView').say('1er tour pour savoir qui va d&eacute;buter.')
							popitblock=0;
							boardview.popperview.updateCursor()
							thisapp.get('activeView').turnshowview.render();
							setTimeout('thisapp.get(\'activeView\').showTurn()',3000)
							break;
							
						case 'ppp':  // play popper pre
							
							var tiesclean = ''
							
							var tot = JSON.parse(commanddata)
							
							if (tot['losing']!=0)
							{
								eliminated = tot['losing'];
							}
							if (tot['winning']!=0)
							{
								if (tot['player']==game.players.self.id)
								{
									// TODO
									//dispatcher.sendEvent(4,dat['data']['winning']) // show pre win
									setTimeout('game.socket.send(\'c.spw.\'+"'+tot['winning']+'")',2000)
									//is_pre=0;
								}
							}
							else if (tot['tie'].length!=0)
							{
								wtfblock=0;
								for (var i = 0 ; i < tot['tie'].length ; i++)
								{
									pre_played[tot['tie'][i]] = 0
								}
								
							}

							
							if (tot['player']!=game.players.self.id)
							{
								if (tot['winning']!=0)
									popitblock=1;
								if (tot['tie'].length==0)
									pre_played[tot['player']] = tot['played']
								boardview.popperview.forcePop(tot['played']);
								
							}
							else if (tot['winning']==0 || tot['tie'].length!=0)
							{
								//TODO
								game.socket.send('c.ct.')
								
								//dispatcher.sendEvent(2,1) //change turn
							}
							turnshowupdate_lock = 0;
							
							boardview.popperview.updateCursor()
							thisapp.get('activeView').turnshowview.render();
							pre_test_count++
							break
						
						case 'spw':  // show pre win
							var tot = JSON.parse(commanddata)
							var winname = players_info[tot['winner']]['login_name']
							//console.log('currentturc:'+tot['currentTurn'])
							currentTurn = tot['currentTurn']
							
							pre_winner = tot['winner'];
							pre_winner_act = pre_winner;
							
							if (pre_winner==game.players.self.id)
							{
								thisapp.get('activeView').showTurn()
							}
							else
							{
								thisapp.get('activeView').say(winname+' commence.')
							}
							is_pre=0
							thisapp.get('activeView').turnshowview.render();
							
							//setTimeout('is_pre=0; thisapp.get(\'activeView\').showTurn();',2000)
							break
							
						case 'udc': // update player color
							var tot = JSON.parse(commanddata)
							var playerplayed = tot['player']
							var colplayed = tot['color']
							thisapp.get('activeView').updatePlayerColor(playerplayed,colplayed)
							break;
							
						case 'rd': // roll dice
							var tot = JSON.parse(commanddata)
							if (tot['player']!=game.players.self.id)
							{
								boardview.popperview.forcePop(tot['played']);
							}
							else
							{
								//console.log('Check moves played='+tot['played'])
								possible_moves=boardview.checkMoves(parseInt(tot['played']));
								if (possible_moves==0)
								{
									if (playasecondtime==1)
									{
										var ret = {}
										ret['player'] = game.players.self.id
										ret['playagain'] = 1										
										game.socket.send('c.ssp.'+JSON.stringify(ret))  // show play second time 
										//dispatcher.sendEvent(10,1) // show play second time
									}
									else
									{
										var ret = {}
										ret['player'] = game.players.self.id
										//console.log('MY ID BEFORE SCP:'+ret['player'])
										game.socket.send('c.scp.'+JSON.stringify(ret))  // show cannot play
										//dispatcher.sendEvent(7,0) // show cannot play
									}
								}
								else
								{
									secondstep=1;
								}
							}							
							break
							
						case 'ssp':  // show 2nd play
							var tot = JSON.parse(commanddata)
							var msg = ''
							if (tot['player']!=game.players.self.id)
							{
								if (tot['playagain']==1)
									msg = players_info[tot['player']]['login_name']+' ne peut pas jouer mais il lance encore.'
								else
									msg = players_info[tot['player']]['login_name']+' joue encore.'
							}
							else
							{
								if (tot['playagain']==1)
									msg = 'Pas de coups possibles mais tu joues encore.'
								else
									msg = 'Tu joues encore.'


								popitblock = 0;
								wtfblock = 0;
								possible_moves = {}
								secondstep=0;
								changeturnafterroll = false;
								playasecondtime++;
								var pions = playerpionviews[game.players.self.id];
								for (var id in pions)
								{
									if (pions.hasOwnProperty(id))
									{
										var pv = pions[id];

										pv.canplay=false;
									}
								}
							}
							thisapp.get('activeView').say(msg)							
							break
							
						case 'scp': // show cannot play
							//console.log('raw SCP'+commanddata)
							var tot = JSON.parse(commanddata)
							secondstep=0;
							var msg = ' ne peut pas jouer.';
							
							//console.log('SCP: player:'+tot['player']+'  players_info:'+players_info.toSource())
							if (tot['player']!=game.players.self.id)
								msg = players_info[tot['player']]['login_name']+' ne peut pas jouer.'
							else
							{
								msg = 'Tu ne peux pas jouer.'
								//TODO
								setTimeout('game.socket.send(\'c.ctg.1\');',1500)   //change turn in game  
								//dispatcher.sendEvent(8,1) //change turn in game
							}
							
							turnshowupdate_lock = 0;
							boardview.popperview.updateCursor()

							thisapp.get('activeView').say(msg)
							break
						case 'ctg':  // change turn in game
							playasecondtime = 0;
							thisapp.get('activeView').turnshowview.render();
							if (myturn) popitblock=0;
							break
							
						case 'sem':  // show one player end game 
							var tot = JSON.parse(commanddata)
							var msg = ''
							var animpos = tot['animpos']
							var wonpos =  tot['won_pos']

							
							wontrophees[tot['player']] = wonpos
							//console.log('player '+tot['player']+' won pos '+wonpos)
							counttrophees++
							var totplayersremaining = tot['totplayersremaining']


							if (tot['player']!=game.players.self.id)
							{
								if (counttrophees==1)
									msg = players_info[tot['player']]['login_name']+' a gagn&eacute; la partie!'
								else if (counttrophees==2)
									msg = players_info[tot['player']]['login_name']+' gagne la 2i&egrave;me place!'
								else if (counttrophees==3)
									msg = players_info[tot['player']]['login_name']+' gagne la 3i&egrave;me place!'

								boardview.moveAnim(animpos);

							}
							else
							{
								if (counttrophees==1)
									msg = 'Tu as a gagn&eacute; la partie!'
								else if (counttrophees==2)
									msg = 'Tu as a gagn&eacute; la 2i&egrave;me place!'
								else if (counttrophees==3)
									msg = 'Tu as a gagn&eacute; la 3i&egrave;me place!'
								
								parrframe.app.get('activeView').playAudio(GAME_NAME,'win')
							}
							thisapp.get('activeView').say(msg)


							if (totplayersremaining==1)
								gameended = 1;
							if (totplayersremaining==1 && game.players.self.host)
							{
								//TODO
								game.socket.send('c.sf.')  // show final
								//dispatcher.sendEvent(12,0);

							}
							
							currentTurn = tot['current_turn']
							//console.log('currentturn----'+currentTurn)
							playasecondtime = 0;
							if (currentTurn!=game.players.self.id)
							{
								myturn = false
								popitblock=1
								//console.log('my turn!')
							}
							else
							{
								myturn = true
								popitblock=0
								//console.log('not my turn!')
							}
							thisapp.get('activeView').turnshowview.render();
							
							setTimeout('thisapp.get(\'activeView\').turnshowview.render(); if (myturn) { popitblock=0 }',2000)
							break
							
						case 'sf':  // show final
							gameended = 1
							boardview.showFinal()
							thisapp.get('activeView').turnshowview.render();
							break
							
						case 'mov':
							var tot = JSON.parse(commanddata)
							turnshowupdate_lock = 1
							if (tot['player']==game.players.self.id)
							{
								if (playasecondtime==1)
								{
									var ret = {}
									ret['player'] = game.players.self.id
									ret['playagain'] = 0										
									game.socket.send('c.ssp.'+JSON.stringify(ret))  // show play second time 
									//dispatcher.sendEvent(10,0) // show play second time
								}
								else
								{
									setTimeout('game.socket.send(\'c.ctg.1\');',1500)   //change turn in game  
								}
							}
							else
							{
								//console.log('moveAnim enqueue:'+JSON.stringify(tot))
								parr.client_ongetpionmoved(JSON.stringify(tot['data']))
								//boardview.moveAnim(tot['data']);
							}
							
							setTimeout('turnshowupdate_lock = 0; boardview.popperview.updateCursor(); thisapp.get(\'activeView\').turnshowview.render(); ',1500)
							
							
							break
					}
				break;
			}
    	});
};


