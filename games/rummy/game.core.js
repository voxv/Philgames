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


game_core.prototype.client_onjoingame = function(data) {

    this.players.self.host = false;
};

game_core.prototype.client_onhostgame = function(data) {

    this.players.self.host = true;

};
game_core.prototype.client_onstartgame = function(data) {

    thisapp.get('activeView').startGame(data);   // player order is passed
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
			this.players.others[newplayer.id]  = newplayer
			players_info[newplayer.id] = {'login_name':newplayer.login_name}
			thisapp.get('activeView').loginOtherPlayer(newplayer.id);
		}
		else
			thisapp.get('activeView').loginOtherPlayer(vv['id']);
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

							game.players.self.id = commanddata
							players_info[game.players.self.id] = {'login_name':game.players.self.login_name}
							break

						case 'gxc':   // give x cards

							var allhands = JSON.parse(commanddata)
							var myhand = allhands[game.players.self.id]
							deck.giveXCardsToPlayer(myhand)
							var mds = thisapp.get('activeView').minidecks
							for (var i = 0 ; i < mds.length ; i++)
							{
								var oh = allhands[mds[i].get('model').get('player_id')]
								mds[i].giveXCardsToPlayer(oh)
							}
							gridview.render()

							if (game.players.self.host)
							{
								game.socket.send('c.pot.')   // put 1st card on trash
							}
							break;

						case 'pot':  // put 1st card on trash (anim)

							var tot = JSON.parse(commanddata)
							var ct = tot['current_turn']
							var first_card = tot['first_card']
							cardviews[first_card].get('model').set('inDeck',0)
							deck.render()
							cardsinited = true
							break

						case 'gto':   // get trash order

							var vv = JSON.parse(commanddata)
							trash.clearAll()
							trashorder = vv
							trash.refreshOrder(vv)
							trash.render()
							break

						case 'gds':   // get deck state

							var tot = JSON.parse(commanddata)
							totalCardsInDeck = tot['totalcardsindeck']
							topDeckCard = tot['topcard']
							//TODO
							if (topDeckCard==-1 && game.players.self.host)
								game.socket.send('c.trs.')   // transfer
							break;

						case 'gh':   // get hands

							hands = JSON.parse(commanddata)
							hand = hands[game.players.self.id]
							console.log('got hand '+hand.toSource())
							break;

						case 'trs':  // transfer

							parrframe.app.get('activeView').playAudio(GAME_NAME,'shuffle')
							var to = JSON.parse(commanddata)
							for (var i=0 ; i < to.length ; i++)
							{
								cardviews[to[i]].get('model').set('inDeck',1)
								cardviews[to[i]].image.setStyle('display','none')
							}
							deck.render();
							break

						case 'gcp':  // give card to player from deck (anim)

							var tot = JSON.parse(commanddata)
							var player_played = tot['pickedplayer'];
							var card_played = tot['pickedcard'];
							if (player_played!=game.players.self.id)
							{
								thisapp.get('activeView').addCardFromDeck(card_played,player_played)
							}
							break

						case 'gcpt':  // give card to player from trash (anim)

							var tot = JSON.parse(commanddata)
							var player_played = tot['pickedplayer'];
							var card_played = tot['pickedcard'];
							if (player_played!=game.players.self.id)
							{
								thisapp.get('activeView').addCardFromTrash(card_played,player_played)
							}
							break

						case 'pont': // play on trash  (anim)

							var tot = JSON.parse(commanddata)
							var player_played = tot['pickedplayer'];
							var card_played = tot['pickedcard'];
							if (player_played!=game.players.self.id)
							{
								thisapp.get('activeView').playOnTrash(player_played,card_played)
							}
							in_anim = true;
							break

						case 'ct':    //change turn

							var newturn = commanddata
							thisapp.get('activeView').highlightName(newturn)
							if (newturn==game.players.self.id)
							{
								myturn = true
								if (!first_turn_notice)
								{
									thisapp.get('activeView').say('C\'est ton tour')
									first_turn_notice=false
								}
							}
							else
							{
								myturn = false
								if (!first_turn_notice)
								{
									thisapp.get('activeView').say('C\'est au tour de '+players_info[newturn]['login_name'])
									first_turn_notice=false
								}
							}
							break

						case 'crg':  // create group

							var tot = JSON.parse(commanddata)
							var player_played = tot['player_played'];
							var card_played = tot['card_data'];

							if (player_played!=game.players.self.id)
							{
								thisapp.get('activeView').createGroup(card_played,player_played)
							}
							break;

						case 'acg':  // add card to group

							var tot = JSON.parse(commanddata)
							var player_played = tot['player_played'];
							var card_played = tot['card_data'];

							if (player_played!=game.players.self.id)
							{
								thisapp.get('activeView').addCardToGroup(card_played,player_played)
							}
							break;

						case 'win':
							playerwon = commanddata
							thisapp.showView('gamefinish')
					}
				break;
			}
    	});
};


