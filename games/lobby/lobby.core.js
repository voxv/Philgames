
var parrframe = parent

var lobby_core = function(){

	this.login_name = '';
	this.gameapp = null;
	this.selectedGame = '';
	this.hosting = false;
	this.pendingJoinRequest = false;
};

if( 'undefined' != typeof global ) {
    module.exports = global.lobby_core = lobby_core;
}

lobby_core.prototype.sendJoinRequest = function(selectedGame,gameid)
{
	if (this.pendingJoinRequest) return;
	this.socket.send('c.jr.'+selectedGame+'|||'+gameid);
	this.pendingJoinRequest = true;
};

lobby_core.prototype.client_connect_to_server = function(login_name) {

        this.socket = parent.main_instance.socket;

        if (parrframe.main_instance.subscribedTo!=GAME_NAME)
        {
			if (parent.main_instance.subscribedTo!='')
				this.socket.emit('unsubscribe',parent.main_instance.subscribedTo);
			this.socket.emit('subscribe','lobby')
			parent.main_instance.subscribedTo = 'lobby'
		}
        this.socket.send('c.l.'+login_name)

        var parr = parent
    	this.socket.on('message', function(data)
    	{

			var commands = data.split('.');
			var command = commands[0];
			var subcommand = commands[1] || null;
			var commanddata = commands[2] || null;

			switch(command) {
				case 's': //server message

					switch(subcommand) {

						case 'ggl' :   // receive game list
							//console.log('got ggl:'+commanddata)
							var c = JSON.parse(commanddata)
							//console.log('got ggl:'+c.toSource())
							app.get('activeView').updateGameList(c);
							break;

						case 'h' :   // host game

							this.hosting = true;
							parr.main_instance.hosting = true
							var aa = commanddata.split('||||');
							parr.app.get('activeView').setGame(aa[1],aa[0]);
							break;

						case 'jrj' :   // join rejected

							app.get('activeView').joinlocked = false;
							break;

						case 'jac' :   // join accepted

							app.get('activeView').joinlocked = false;
							this.hosting = false;
							parr.main_instance.hosting = false
							parr.app.get('activeView').setGame(parrframe.main_instance.lastSelectedGame,commanddata);
							break;
					}
				break;
			}
		});
		//console.log(this.socket)
};