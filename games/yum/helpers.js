document.body.addEventListener("touchmove", function(evt){
	evt.preventDefault()
});
document.body.addEventListener("touchstart", function(evt)
{
	if ((evt.targetTouches && evt.targetTouches.item(0) && evt.targetTouches.item(0).target && evt.targetTouches.item(0).target.src && evt.targetTouches.item(0).target.src.indexOf('png')!=-1) || (evt.targetTouches && evt.targetTouches.item(0) && evt.targetTouches.item(0).target  && evt.targetTouches.item(0).target.nodeName=='BUTTON')) { 	}
	else evt.preventDefault()
}, false);

Object.prototype.toSource
    || (Object.prototype.toSource = function(){return JSON.stringify(this);})


function Queue(){var a=[],b=0;this.getLength=function(){return a.length-b};this.isEmpty=function(){return 0==a.length};this.enqueue=function(b){a.push(b)};this.dequeue=function(){if(0!=a.length){var c=a[b];2*++b>=a.length&&(a=a.slice(b),b=0);return c}};this.peek=function(){return 0<a.length?a[b]:void 0}};


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

function processMoveOpponent()
{
	if (thisapp.get('activeView').processMoveOpponent)
	thisapp.get('activeView').processMoveOpponent()
}
processmoveopponent = processMoveOpponent

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

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex ;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}

