YUI.add("playerlist", function(Y) {
	Y.Player = new Y.Base.create('player',Y.Model,[],
	{
		ATTRS:
		{
			id:{ value:0 },
			login_name: { value:0 },
		}
	});
	Y.PlayerView = Y.Base.create('playerview',Y.View,[],
	{
		imgcrown:null,
		clickadded:false,
		initializer: function()
		{
			var m = this.get('model');
			var c = this.get('container');

			if (m.get('login_name')!=undefined && m.get('login_name').length>1)
			{
				var src ='trans.png';
				var id = this.get('model').get('id');
				
				if (id == game.players.self.id && game.players.self.host)
				{
					src ='littlecrown.png';
				}
				
				var imgcrown = '<img style="margin-left:14px; margin-bottom:24px;" id="ready_'+m.get('id')+'" src="./images/'+src+'"/>';

				
				c.append('<div class="playerlistentry"><div id="playername_'+m.get('id')+'" class="'+('playerlistentryname_green')+' playernameentery">'+m.get('login_name')+'</div>'+imgcrown+'</div>');

				this.imgcrown = c.one('#ready_'+m.get('id'))
				
			}
		},
		render: function()
		{
			if (game.players.self.host && !this.clickadded)
			{
				par = this;
				this.get('container').setStyle('cursor','pointer');
				var m = this.get('model')
				
				if (m.get('id') == game.players.self.id)
					this.imgcrown.set('src','./images/littlecrown.png')

			}	
			return this;
		}
	});
	Y.PlayerListView = Y.Base.create('playerlistview',Y.View,[],
	{
		list:null,
		playerViews:{},
		initializer: function()
		{
			playerlist = this.playerlist = new Y.ModelList();
			playerlist.after('add',this.addPlayerToList,this);
			playerlist.after('remove',this.removePlayerToList,this);
			this.get('container').set('className','playerviewcontainer');
			this.playerViews = {}
		},
		addPlayerToList: function(e)
		{

			this.list = e.currentTarget;
			list_size = this.list.size()-1;

			var newv = new Y.PlayerView({model:this.list.item(list_size)});
			this.playerViews[newv.get('model').get('id')] = newv
			newv.render();

			this.get('container').append(newv.get('container'));

			this.render();

		},
		removePlayerToList: function(e)
		{
			this.get('container').setHTML('');
			var tthis = this

			this.list.each(function(model,ind,thislist){

				var newv = new Y.PlayerView({model:model});
				tthis.playerViews[model.get('id')] = newv
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