var DEVMODE = false;

var main_core = function(playerprofile_instance){

	this.login_name = '';
	this.activeGame = '';
	this.subscribedTo = '';
	this.debug = false;
	this.hosting=false;
	this.reconnected = false;
	this.lastSelectedGame = '';
	this.low_res = false;
};

if( 'undefined' != typeof global ) {
    module.exports = global.main_core = main_core;
}

main_core.prototype.client_connect_to_server = function(login_name) {
		/*if (ismobile())
		{
			this.low_res = true;
		}*/
	/*if (!DEVMODE){
		this.socket = io.connect()
        //this.socket = io.connect('https://philgames.herokuapp.com/');
        console.log('maincore trying to connecto to https://philgames.herokuapp.com:')
   }
	else
		this.socket = io.connect()*/

	var proto = 'ws'
	var is_local = false
	if (window.location.hostname === 'phil-games.onrender.com') {
		url = 'phil-games.onrender.com'
		proto = 'wss'
	} else {
		url = 'localhost:3000'
		is_local = true
	}

	this.socket = io(proto + "://" + url, {
		transports: ['websocket']
	});
};