document.body.addEventListener("touchmove", function(evt){
	evt.preventDefault()
});
document.body.addEventListener("touchstart", function(evt)
{
	if ((evt.targetTouches && evt.targetTouches.item(0) && evt.targetTouches.item(0).target && evt.targetTouches.item(0).target.src && evt.targetTouches.item(0).target.src.indexOf('png')!=-1) || (evt.targetTouches && evt.targetTouches.item(0) && evt.targetTouches.item(0).target  && evt.targetTouches.item(0).target.nodeName=='BUTTON') || (evt.targetTouches && evt.targetTouches.item(0) && evt.targetTouches.item(0).target  && evt.targetTouches.item(0).target.nodeName=='INPUT') || (evt.targetTouches && evt.targetTouches.item(0) && evt.targetTouches.item(0).target  && evt.targetTouches.item(0).target.innerHTML.indexOf('GO')!=-1)) { 	}
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

window.addEventListener('pageshow', function(e){  }, false);
window.addEventListener('pagehide', function(e){}, false);

function saveInCache(key,data)
{
	//localStorage.removeItem(CACHE_PREFIX+'profiles');

	localStorage && localStorage.setItem(CACHE_PREFIX+key, JSON.stringify(data));
}
function getFromCache(key)
{
	var data = JSON.parse((localStorage && localStorage.getItem(CACHE_PREFIX+key)) || null);
	return data
}
function removeFromCache(key)
{
	var data = JSON.parse((localStorage && localStorage.removeItem(CACHE_PREFIX+key)) || null);
	return data
}

