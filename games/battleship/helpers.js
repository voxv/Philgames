document.body.addEventListener("touchmove", function(evt){
	evt.preventDefault()
});
document.body.addEventListener("touchstart", function(evt)
{
	if (evt.targetTouches && evt.targetTouches.item(0) && evt.targetTouches.item(0).target && evt.targetTouches.item(0).target.src && evt.targetTouches.item(0).target.src.indexOf('ship')!=-1) { 	}
	else evt.preventDefault()
}, false);

Object.prototype.toSource
    || (Object.prototype.toSource = function(){return JSON.stringify(this);})


function inArray(needle, haystack) {
	var length = haystack.length;
	for(var i = 0; i < length; i++) {
		if(haystack[i] == needle) return true;
	}
	return false;
}

function Say(msg,started)
{
	if (thisapp.get('activeView').say)
	thisapp.get('activeView').say(msg,started)
}
say = Say

function gotoEndGame()
{
	thisapp.showView('gamefinish');
}
gotoendgame = gotoEndGame;


window.addEventListener('pageshow', function(e){  }, false);
window.addEventListener('pagehide', function(e){}, false);

function saveInCache(key,data)
{
	localStorage && localStorage.setItem(CACHE_PREFIX+key, JSON.stringify(data));

}
function getFromCache(key)
{
	var data = JSON.parse((localStorage && localStorage.getItem(CACHE_PREFIX+key)) || null);
	return data
}

