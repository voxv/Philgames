YUI_config = {
    modules: {
       'loginmanager': { fullpath: './loginmanager.js', requires:['json-parse','json-stringify','console','app','node','model','model-list','view', 'io','cookie'] },
        'lobby': { fullpath: './lobby.js', requires:['loginmanager','gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io','cookie'] },

    }
};

YUI().use('loginmanager','lobby','gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io', 'cookie', function (Y) { new Lobby(); });
