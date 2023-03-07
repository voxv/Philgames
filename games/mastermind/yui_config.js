YUI_config = {
    modules: {
        'playerlist': { fullpath: './playerlist.js', requires:['json-parse','json-stringify','console','app','node','model','model-list','view', 'io'] },
        'chat': { fullpath: './chat.js', requires:['gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io'] },
        'gameapp': { fullpath: './gameapp.js', requires:['chat','playerlist','gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io'] },
        'homehead': { fullpath: './home_head.js', requires:['gallery-audio','json-parse','json-stringify','console','app','node','model','view', 'io'] },
        'board': { fullpath: './board.js', requires:['selectr2','json-parse','json-stringify','console','app','node','model','model-list','view', 'io'] },
        'selectr2': { fullpath: './selector.js', requires:['json-parse','json-stringify','console','app','node','model','model-list','view', 'io','dd-constrain','dd-drag'] },

    }
};

YUI().use('gameapp','board','selectr2','homehead','chat','playerlist','gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io', function (Y) { new GameApp(); });
