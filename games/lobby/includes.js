var GAME_NAME = 'lobby';

function loadScript(url)
{
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    head.appendChild(script);
}
loadScript('./globals.js');
loadScript('./helpers.js');
loadScript('./lobby.js');
loadScript('/socket.io/socket.io.js');
loadScript('./lobby.core.js');

var lobby_instance = {};
var socket = null;
window.onload = function(){ lobby_instance = new lobby_core();  };