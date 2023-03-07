YUI_config = {
    modules: {
        'playerlist': { fullpath: './playerlist.js', requires:['json-parse','json-stringify','console','app','node','model','model-list','view', 'io'] },
        'chat': { fullpath: './chat.js', requires:['gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io'] },
        'gameapp': { fullpath: './gameapp.js', requires:['chat','playerlist','gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io'] },
        'homehead': { fullpath: './home_head.js', requires:['gallery-audio','json-parse','json-stringify','console','app','node','model','view', 'io'] },
       	'card': { fullpath: './card.js', requires:['gallery-audio','dd-constrain','dd-drag','dd-drop','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io'] },
       	'groups': { fullpath: './groups.js', requires:['gallery-audio','dd-constrain','dd-drag','dd-drop','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io'] },

    }
};

YUI().use('gameapp','homehead','chat','playerlist','groups','transition','card','gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io', function (Y) { new GameApp(); });
