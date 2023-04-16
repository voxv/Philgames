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
loadScript('./gameapp.js');
loadScript('/socket.io/socket.io.js');
loadScript('./game.core.js');

var game = {};
var socket = null;
window.onload = function(){  game = new game_core();  };