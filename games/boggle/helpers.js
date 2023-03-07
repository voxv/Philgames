document.body.addEventListener("touchmove", function(evt){
	evt.preventDefault()
});

document.body.addEventListener("touchstart", function(evt){
	if ((evt.targetTouches && evt.targetTouches.item(0) && evt.targetTouches.item(0).target && evt.targetTouches.item(0).target.src && evt.targetTouches.item(0).target.src.indexOf('png')!=-1) || (evt.targetTouches && evt.targetTouches.item(0) && evt.targetTouches.item(0).target  && evt.targetTouches.item(0).target.innerHTML=='GO'))
	{
	
	}
	else
	{
		evt.preventDefault()
	}
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



function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

	// Pick a remaining element...
	randomIndex = Math.floor(Math.random() * currentIndex);
	currentIndex -= 1;

	// And swap it with the current element.
	temporaryValue = array[currentIndex];
	array[currentIndex] = array[randomIndex];
	array[randomIndex] = temporaryValue;
  }

  return array;
}
function processMoveOpponent()
{
	if (thisapp.get('activeView').processMoveOpponent)
	thisapp.get('activeView').processMoveOpponent()
}
processmoveopponent = processMoveOpponent

window.addEventListener('pageshow', function(e){   }, false);
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


