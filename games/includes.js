function ismobile() {
 if(
	 navigator.userAgent.match(/Android/i)
 	|| navigator.userAgent.match(/webOS/i)
 	|| navigator.userAgent.match(/iPhone/i)
	//|| navigator.userAgent.match(/iPad/i)
 	|| navigator.userAgent.match(/iPod/i)
 	|| navigator.userAgent.match(/BlackBerry/i)
 	|| navigator.userAgent.match(/Windows Phone/i)
 ){
    return true;
  }
 else {
    return false;
  }
}

var metaTag=document.createElement('meta');
metaTag.name = "viewport"
var scale = 0.67
if (ismobile())
	scale = 0.4;

metaTag.content = "width=device-width, initial-scale="+scale+", maximum-scale="+scale+", user-scalable=0"

document.getElementsByTagName('head')[0].appendChild(metaTag);

var main_instance = {};
var socket = null;
window.onload = function(){ main_instance = new main_core();  };

function loadScript(url)
{
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    head.appendChild(script);
}
loadScript('/games/main.js');
loadScript('/socket.io/socket.io.js');
loadScript('/games/main.core.js');

//loadScript('https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js')
//loadScript('https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js')