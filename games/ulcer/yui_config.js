YUI_config = {
    modules: {
        'playerlist': { fullpath: './playerlist.js', requires:['json-parse','json-stringify','console','app','node','model','model-list','view', 'io'] },
        'chat': { fullpath: './chat.js', requires:['gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io'] },
        'gameapp': { fullpath: './gameapp.js', requires:['chat','playerlist','gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io'] },
        'homehead': { fullpath: './home_head.js', requires:['gallery-audio','json-parse','json-stringify','console','app','node','model','view', 'io'] },
        'board': { fullpath: './board.js', requires:['gallery-audio','popper','json-parse','json-stringify','console','app','node','model','model-list','view', 'io'] },
		'dice': { fullpath: './dice.js', requires:['gallery-audio','json-parse','json-stringify','console','app','node','model','model-list','view', 'io'] },
		'pion': { fullpath: './pion.js', requires:['gallery-audio','json-parse','json-stringify','console','app','node','model','model-list','view', 'io'] },
		'colorchooser': { fullpath: './colorchooser.js', requires:['json-parse','json-stringify','console','app','node','model','model-list','view', 'io'] },
		'turnshow': { fullpath: './turnshow.js', requires:['json-parse','json-stringify','console','app','node','model','model-list','view', 'io'] },
		'popper': { fullpath: './popper.js', requires:['gallery-audio','dice','json-parse','json-stringify','console','app','node','model','model-list','view', 'io','dd-constrain','dd-drag'] },

    }
};

YUI().use('gameapp','homehead','board','popper','dice','pion','colorchooser','turnshow','chat','playerlist','transition','gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io', function (Y) { new GameApp(); });
