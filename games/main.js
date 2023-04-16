YUI.add("main", function(Y) {

	var console = new Y.Console();
	//console.render();

	Y.Home = Y.Base.create('login',Y.View,[],
	{
		theframe:null,
		master_audio:null,
		initializer: function(){
			// 1290 x 900
			main_instance.client_connect_to_server();
			var gf = Y.Node.create('<div style="background-color:#ffffff; position:fixed; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;"><iframe  id="gameframe" scrolling="no" width=1290 height=900 src="./games/lobby/index.html"></iframe></div>');
			this.get('container').append(gf);
			this.theframe = gf.one('iframe');
			this.master_audio = new Audio('./games/lobby/sounds/click.mp3');
		},
		playAudio:function(gamename,fname,cb)
		{
			this.master_audio.onended = null;
			this.master_audio.setAttribute('src','./games/'+gamename+'/sounds/'+fname+'.mp3');
			this.master_audio.play();
			if (cb)
			{
				this.master_audio.onended = cb
			}
		},
		stopSounds:function()
		{
			this.master_audio.pause();
		},
		setGame:function(gamename,gameid)
		{
			main_instance.activeGame = gameid;
			var iframe = this.get('container').one('iframe')
			iframe.setAttribute('src','./games/'+gamename+'/index.html');
			if (gamename=='ulcer') {
				iframe.setAttribute('width','1900px');
				iframe.setAttribute('height','1216px');
			}
		},
		render: function()
		{
				return this;
		}
	});

	var main = function()
	{
		app = new Y.App({
			views: {
				 home   : {type: 'Home'},
			},
			viewContainer: '#wrapper',
			serverRouting : false,
		});

		app.route('/', function () {

			app.showView('home');

		});

		app.navigate('/');
	}
	Main = main;

}, '1.0', {requires: ['gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});

