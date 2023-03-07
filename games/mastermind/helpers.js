document.body.addEventListener("touchmove", function(evt){

if (evt.targetTouches && evt.targetTouches.item(0) && evt.targetTouches.item(0).target && evt.targetTouches.item(0).target.innerHTML=='GO')
{
}
else
evt.preventDefault()

});
document.body.addEventListener("touchstart", function(evt){
//if (evt.targetTouches && evt.targetTouches.item(0) && evt.targetTouches.item(0).target)
//	Y.log(evt.targetTouches.item(0).target.innerHTML);
if ((evt.targetTouches && evt.targetTouches.item(0) && evt.targetTouches.item(0).target && evt.targetTouches.item(0).target.src && evt.targetTouches.item(0).target.src.indexOf('png')!=-1) || (evt.targetTouches && evt.targetTouches.item(0) && evt.targetTouches.item(0).target  && evt.targetTouches.item(0).target.innerHTML=='GO'))
{
	if (evt.targetTouches && evt.targetTouches.item(0) && evt.targetTouches.item(0).target && evt.targetTouches.item(0).target.src && (evt.targetTouches.item(0).target.src.indexOf('cover2')!=-1 || evt.targetTouches.item(0).target.src.indexOf('bg')!=-1 || evt.targetTouches.item(0).target.src.indexOf('board')!=-1))
	{
		evt.preventDefault()
	}
}
else
{
	//if (evt.targetTouches.item(0).target)
	//alert(evt.targetTouches.item(0).target.toSource())
	evt.preventDefault()
}
});

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

function hideWinLose()
{
	thisapp.get('activeView').sendEndGame()

	//TODO
	//setTimeout('loopback()',9000);
}
hidewinlose = hideWinLose;

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


