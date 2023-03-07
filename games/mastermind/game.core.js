var parrframe = parent;
var game_core = function(){

    this.players = {
        self : new game_player(this),
        other : new game_player(this)
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

    thisapp.get('activeView').startGame();
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
game_core.prototype.client_ongetscores = function(score_host,score_client)
{
	game.players.self.score=score_host
	game.players.other.score=score_client
	thisapp.get('activeView').updateScore();
}

game_core.prototype.client_onlogin = function(data)
{
		if (thisapp.get('activeView').loginOtherPlayer == undefined) return;
		this.players.other.login_name = data
		thisapp.get('activeView').loginOtherPlayer();
}
game_core.prototype.client_ondisconnect = function() {
	if (checkothermovesTO) clearInterval(checkothermovesTO)
	if (gamestarted)
		thisapp.get('activeView').stopGame();
	if (thisapp.get('activeView').removeOtherPlayer)
    thisapp.get('activeView').removeOtherPlayer();
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
							parr.client_ondisconnect(commanddata); break;
						case 'l' : // notify login
							parr.client_onlogin(commanddata); break;
						case 'iw' :   // win result (data==1 means host won)
							parr.client_onwin(commanddata); break;
						case 'sc' : // get scores
							var scores = commanddata.split('-');
							var score_host = scores[0];
							var score_client = scores[1];
							parr.client_ongetscores(score_host,score_client); break;
						case 'sg' :   // start game
							parr.client_onstartgame(); break;
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
						case 'gid':   // get my pplayer id

							myplayerid = commanddata
							//console.log('my id:'+commanddata)
							players_info[myplayerid] = {'login_name':game.players.self.login_name}
							break
						case 'god':   // get other pplayer id

							otherplayerid = commanddata
							players_info[otherplayerid] = {'login_name':game.players.other.login_name}
							//console.log(players_info.toSource())
							break
						case 'gcm':  // get current master
							if (game.players.self.host)
							{
								if (commanddata=='host')
									current_master=myplayerid
								else
									current_master=otherplayerid
							}
							else
							{
								if (commanddata=='host')
									current_master=otherplayerid
								else
									current_master=myplayerid
							}

							break;
						case 'ss': // send solution

							solution = JSON.parse(commanddata)
							//console.log('got solution:'+solution.toSource())
							thisapp.get('activeView').showTurn()
							//console.log('setting colors_set to true')
							colors_set = true;
							break;
						case 'cs':    // calculate results


							var vv = JSON.parse(commanddata)
							current_hints_str = commanddata


							//console.log('addhints '+vv.toSource())


							if (current_master==myplayerid)
							{

								boardview.addHints();
								current_row--
								boardview.totalSelected = 0;
								boardview.row_pieces = [];


								if (vv[0]==4)
									endgame = 1;
								else if (current_row<0)
									endgame = 2;
								if (endgame!=0)
								{
									if (endgame==1)
									{
										boardview.showWin();
									}
									else
									{
										boardview.showLose();
									}

								}
							}
							else
							{
								current_row--;
								boardviewplayer.addHints();

								if (vv[0]==4)
									endgame = 1;
								else if (current_row<0)
									endgame = 2;
								if (endgame!=0)
								{
									if (endgame==1)
									{
										boardviewplayer.showWin();
									}
									else
									{
										boardviewplayer.showLose();
									}
								}
							}

							current_row_str=''

							break;

						case 'ur':  // update row (on master only)
							current_row_str = commanddata;
							//console.log('got ur:'+commanddata)
							boardview.updateCurrentRow();

							break;

					}
				break;
			}
    	});
};


