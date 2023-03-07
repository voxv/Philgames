YUI_config = {
    modules: {
        'main': { fullpath: './games/main.js', requires:['gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io','cookie', 'datatable-base'] },
    }
};

YUI().use('main','gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io', 'cookie', 'datatable-base', function (Y) { new Main(); });
