YUI_config = {
    modules: {
        'playerlist': { fullpath: './playerlist.js', requires:['json-parse','json-stringify','console','app','node','model','model-list','view', 'io'] },
        'chat': { fullpath: './chat.js', requires:['gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io'] },
        'gameapp': { fullpath: './gameapp.js', requires:['chat','playerlist','gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io'] },
        'homehead': { fullpath: './home_head.js', requires:['gallery-audio','json-parse','json-stringify','console','app','node','model','view', 'io'] },
        'ship': { fullpath: './ship.js', requires:['gallery-audio','json-parse','json-stringify','console','app','node','model','view', 'io'] },
    	'grids': { fullpath: './grids.js', requires:['gallery-audio','json-parse','json-stringify','console','app','node','model','model-list','view', 'io'] },
    }
};

YUI().use('gameapp','grids','ship','homehead','chat','playerlist','gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io', function (Y) { new GameApp(); });
