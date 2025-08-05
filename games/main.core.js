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

	var proto = 'ws'
	var is_local = false
	if (window.location.hostname === 'philgames.onrender.com') {
		url = 'philgames.onrender.com'
		proto = 'wss'
	} else {
		url = 'localhost:3000';
		is_local = true
		console.log('is local')
	}

	this.socket = io(proto + "://" + url, {
		transports: ['websocket']
	});
};
