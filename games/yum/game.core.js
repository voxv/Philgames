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
	 checkothermovesTO = setInterval('processmoveopponent()',4)
    thisapp.get('activeView').startGame();
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
						case 'sc' : // get scores
							var scores = commanddata.split('-');
							var score_host = scores[0];
							var score_client = scores[1];
							parr.client_ongetscores(score_host,score_client); break;
						case 'sg' :   // start game
							if (game.players.self.host)
							{
								if (commanddata=='host')
									myturn = true;
								else
									myturn = false;
							}
							else
							{
								if (commanddata=='host')
									myturn = false;
								else
									myturn = true;
							}
							parr.client_onstartgame(); break;
						case 'lb' :   // loop back - host is back home  , client can go on too
							if (!game.players.self.host) return
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
						case 'gs' :  // update scores
							var tot = JSON.parse(commanddata)
							if (tot['scorecards'])
							{
								var sc = app.get('activeView').scorecard
								sc.updateScores(tot['scorecards'])
							}
							break;
						case 'pdc': // put dice in cup
							var gameboard = thisapp.get('activeView').gameboard
							var scorecard = thisapp.get('activeView').scorecard
							var dices = JSON.parse(commanddata)
							if (!myturn)
							{
								if (dices.length==5)
								{
									//animsqueue.enqueue(JSON.stringify(dices))
									gameboard.putDicesInCup(dices,true)  // true for anim (other player)
									//console.log('enqueue:'+JSON.stringify(dices))
								}
									//gameboard.putDicesInCup(dices,true)  // true for anim (other player)
								else
								{

									//if (animsqueue.isEmpty())
									//	gameboard.addDiceInCup(dices[0],true)
									//else
										//console.log('enqueue:'+dices[0])
										var da = []
										da.push(dices[0])
										animsqueue.enqueue(JSON.stringify(da))
								}
							}
							break;
						case 'td': // throw dice
							var gameboard = thisapp.get('activeView').gameboard
							var scorecard = thisapp.get('activeView').scorecard
							var dicesFaces = JSON.parse(commanddata)

							if (!myturn)
							{
								if (!animsqueue.isEmpty() || is_in_anim_dice)
								{
									dice_throw_after_anim = dicesFaces
									has_dice_throw_after_anim = true
									//console.log('other has thrown but queue was not empty saving:'+dice_throw_after_anim.toSource())

								}
								else
								{
									//console.log('queue was empty '+dicesFaces.toSource())
									gameboard.throwDices([370,370],dicesFaces)
									game.socket.send('c.tb.')

								}
							}
							break;
						case 'tb':
							//console.log('other has thrown back')
							otherhasthrown = true;
							break
						case 'et': // end turn

							otherhasthrown = true;

							var vv = JSON.parse(commanddata)

							var ct = vv['current_turn']

							if (game.players.self.host)
							{
								if (ct=='host')
									myturn = true;
								else
									myturn = false;
							}
							else
							{
								if (ct=='host')
									myturn = false;
								else
									myturn = true;
							}

							var scorecards = vv['scorecards'];
							var sc = thisapp.get('activeView').scorecard

							sc.updateScores(scorecards)

							if (vv['isended'])
							{
								myturn=false
								gameended = true
								thisapp.get('activeView').say('La partie est termin&eacute;e')

								setTimeout('game.socket.send("c.gb.");',4000)   // get bonuses
								setTimeout('game.socket.send("c.gus.");',5000)   // get upper score
								setTimeout('game.socket.send("c.gt.");',7000)   // get total score
								return;
							}

							if (myturn)
							{
								subturnbusted = false;
								thisapp.get('activeView').scorecard.subturn= 1;
								firstThrowDone = false;
								thisapp.get('activeView').sayTurn(game.players.self.login_name)
							}
							else
								thisapp.get('activeView').sayTurn(otherplayername)

							firstPutInCupDone = false;
							break;
						case 'gid':   // get my pplayer id

							myplayerid = commanddata
							players_info[myplayerid] = {'login_name':game.players.self.login_name}
							break
						case 'god':   // get other pplayer id

							otherplayerid = commanddata
							players_info[otherplayerid] = {'login_name':game.players.other.login_name}
							break
						case 'gb':   // get bonuses

							var vv = JSON.parse(commanddata)

							var host_bonuses = vv['host']
							var other_bonuses = vv['other']
							var tot = {}
							if (game.players.self.host)
							{
								tot[myplayerid] = host_bonuses
								tot[otherplayerid] = other_bonuses
							}
							else
							{
								tot[myplayerid] = other_bonuses
								tot[otherplayerid] = host_bonuses
							}
							thisapp.get('activeView').scorecard.showBonuses(tot)
							break
						case 'gus':   // get upper scores

							var vv = JSON.parse(commanddata)

							var host_score = vv['host']
							var other_score = vv['other']
							var tot = {}
							if (game.players.self.host)
							{
								tot[myplayerid] = host_score
								tot[otherplayerid] = other_score
							}
							else
							{
								tot[myplayerid] = other_score
								tot[otherplayerid] = host_score
							}
							thisapp.get('activeView').scorecard.showUpperScores(tot)
							break
						case 'gt':   // get total scores

							var vv = JSON.parse(commanddata)

							var host_score = vv['host']
							var other_score = vv['other']
							var tot = {}
							if (game.players.self.host)
							{
								tot[myplayerid] = host_score
								tot[otherplayerid] = other_score
							}
							else
							{
								tot[myplayerid] = other_score
								tot[otherplayerid] = host_score
							}
							thisapp.get('activeView').scorecard.showGrandTotal(tot)
							break
						case 'ssh':   // start shake
							//setTimeout("thisapp.get('activeView').startShake()",2000)
							thisapp.get('activeView').startShake()
							break;
						case 'esh':   // end shake
							//setTimeout("thisapp.get('activeView').stopShake()",2000)
							thisapp.get('activeView').stopShake()
							break;
					}
				break;
			}
    	});
};


