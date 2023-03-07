YUI.add("playerlist", function(Y) {
	Y.Player = new Y.Base.create('player',Y.Model,[],
	{
		ATTRS:
		{
			login_name: { value:0 },
		}
	});
	Y.PlayerView = Y.Base.create('playerview',Y.View,[],
	{
		initializer: function()
		{
			var m = this.get('model');
			var c = this.get('container');

			if (m.get('login_name')!=undefined && m.get('login_name').length>1)
			{
				var src ='ready.png';
				c.append('<div class="playerlistentry"><div class="'+('playerlistentryname_green')+' playernameentery">'+m.get('login_name')+'</div><div class="playerlistentrycheckbox"><img id="ready_'+m.get('id')+'" src="./images/trans.png"/></div></div>');
			}
		},
		render: function()
		{
			return this;
		}
	});
	Y.PlayerListView = Y.Base.create('playerlistview',Y.View,[],
	{
		initializer: function()
		{
			playerlist = this.playerlist = new Y.ModelList();
			playerlist.after('add',this.addPlayerToList,this);
			playerlist.after('remove',this.removePlayerToList,this);
			this.get('container').set('className','playerviewcontainer');
		},
		addPlayerToList: function(e)
		{
			list = e.currentTarget;
			list_size = list.size()-1;
			var newv = new Y.PlayerView({model:list.item(list_size)});
			newv.render();
			this.get('container').append(newv.get('container'));
			this.render();
		},
		removePlayerToList: function(e)
		{
			this.get('container').setHTML('');
			var tthis = this
			list.each(function(model,ind,thislist){
				var newv = new Y.PlayerView({model:model});
				tthis.get('container').append(newv.get('container'));
			});
			this.render();
		},
		render: function()
		{
			return this;
		}
	});
}, '1.0', {requires: ['json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});