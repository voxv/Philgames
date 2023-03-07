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
    checkothermovesTO = setInterval('processmoveopponent()',4)
};
game_core.prototype.client_onsetstartgrid = function(data) {

    thisapp.get('activeView').setStartGrid(data);
};
game_core.prototype.client_onsetstartmini = function(data) {

    thisapp.get('activeView').setStartMini(data);
};
game_core.prototype.client_onsendcurrentsnap = function(data) {

     thisapp.get('activeView').updateSnapshot(data);
};
game_core.prototype.client_onwin = function(data) {

	if (data && !game.players.self.host)
		thisapp.get('activeView').playLoseGame();
	else if (!data)
		thisapp.get('activeView').playWinGame();
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
	clearInterval(checkothermovesTO)
	if (gamestarted)
		thisapp.get('activeView').stopGame();
	if (thisapp.get('activeView').removeOtherPlayer)
    thisapp.get('activeView').removeOtherPlayer();
};

game_core.prototype.client_ongetblocksmoved = function(data) {

	blocksqueue.enqueue(data)
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
						case 'sc' : // get scores
							var scores = commanddata.split('-');
							var score_host = scores[0];
							var score_client = scores[1];
							parr.client_ongetscores(score_host,score_client); break;
						case 'sg' :   // start game
							parr.client_onstartgame(); break;
						case 'ssg' :
							 parr.client_onsetstartgrid(commanddata);  break;
						case 'ssm' :   // set start mini
							parr.client_onsetstartmini(commanddata);  break;
						case 'bm' :   // set start mini
							parr.client_ongetblocksmoved(commanddata);  break;
						case 'scs' :  // snapshot of other player's grid
							 parr.client_onsendcurrentsnap(commanddata);  break;
						case 'rw' :
							if (commanddata==1)
							{
								//thisapp.get('activeView').sendEndGame()
								playwingamestarted = true;
								thisapp.get('activeView').playWinGame()
							}
							else
							{
								animspeedop=0
								blockallinputs = true;
							}
						case 'opw' :
							otherplayerwon = true;
							if (blocksqueue.isEmpty() && !playlosestarted && !playwingamestarted)
							{
								playlosestarted = true;
								//console.log('play lose from opw')
								thisapp.get('activeView').playLoseGame();
							}
							break;
						case 'lb' :
							parrframe.main_instance.hosting = true;
							parrframe.main_instance.reconnected = true;
							if (checkothermovesTO) clearInterval(checkothermovesTO)
							parrframe.app.get('activeView').setGame(GAME_NAME,parrframe.main_instance.activeGame);
							break;
						case 'hl' :
							parrframe.main_instance.reconnected = true;
							if (checkothermovesTO) clearInterval(checkothermovesTO)
							parrframe.app.get('activeView').setGame(GAME_NAME,parrframe.main_instance.activeGame);
							break;
						case 'cm' :
							var aa = commanddata.split('||||');

							var username = aa[0]
							var contentmsg = aa[1]
							thisapp.get('activeView').chatview.chatentrylist.add(new ChatEntryModel({user:username,content:decodeURIComponent(contentmsg)}));
							break;
						case 'rs' :
							thisapp.get('activeView').realStart();
							break;
						case 'sd' :   // send danger sound
							if (!dangeralreadyplayed)
							{
								parrframe.app.get('activeView').playAudio(GAME_NAME,'danger');
								stopclickaudio = true;
								setTimeout('stopclickaudio = false;',3000);
								dangeralreadyplayed = true;
							}
							break;
					}
				break;
			}
    	});
};


