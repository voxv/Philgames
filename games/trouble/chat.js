YUI.add("chat", function(Y) {
	ChatEntryModel = Y.ChatEntryModel = new Y.Base.create('chatentrymodel',Y.Model,[],
	{
		ATTRS:
		{
			user:{ value:0 },
			content:{ value:0 },
		}
	});

	Y.ChatEntryModelView = Y.Base.create('chatEntryModelView',Y.View,[],
	{
		render: function()
		{
			var m = this.get('model');
			var c = this.get('container');
			var isbot = false;
			if (m.get('user')=='Info')
				isbot = true;
			c.append('<div class="chatentry"><div class="chatentryusername">'+(isbot?'<span style="color:#776666">':'')+m.get('user')+(isbot?'</span>':'')+':</div><div class="chatentrymessage">'+m.get('content')+'</div></div>');
		}
	});

	Y.ChatView = Y.Base.create('chatview',Y.View,[],
	{
		initializer: function()
		{
			var container = this.get('container');
			container.set('className',"chatpanel_back_tot");

			var panel = Y.Node.create('<div class="chatpanel_back"></div><div  class="chatinput"><input type="text" size=110 id="chatinput" maxlength=45/></div>');
			container.append(panel);
			chatentrylist = this.chatentrylist = new Y.ModelList();
			chatentrylist.after('add',this.addChatEntry,this);
		},
    	events:
    	{
			'#chatinput': {keypress: 'sendMessage'},
		},
		render: function()
		{
			setTimeout(" if (thisapp.get('activeView').get('container').one('#chatinput')!=undefined) { thisapp.get('activeView').get('container').one('#chatinput').focus(); }",1000);
			return this;
		},
		sendMessage: function(e)
		{
			if (e.keyCode === 13)
			{
				var val = e.currentTarget.get('value');
				if (val!='')
				{
					game.socket.send('c.cm.'+game.players.self.login_name+'||||'+encodeURIComponent(val));
					//Y.log('sending c.cm.'+game.players.self.login_name+'||||'+encodeURIComponent(val))
					//this.chatentrylist.add(new ChatEntryModel({user:game.players.self.login_name,content:e.currentTarget.get('value')}));
				}
			}
		},
		addChatEntry: function(e)
		{
			this.list = e.currentTarget;
			list_size = this.list.size()-1;
			var newv = new Y.ChatEntryModelView({model:this.list.item(list_size)});
			newv.render();
			this.get('container').one('.chatpanel_back').append(newv.get('container'));
			this.get('container').one('#chatinput').set('value','');
			this.get('container').one('.chatpanel_back').set('scrollTop',this.get('container').one('.chatpanel_back').get('scrollHeight'));
		}
	});
}, '1.0', {requires: ['gallery-audio','dd-constrain','dd-drag','slider','graphics','anim','panel','json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});