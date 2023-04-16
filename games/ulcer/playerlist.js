YUI.add("playerlist", function(Y) {
	Y.Player = new Y.Base.create('player',Y.Model,[],
	{
		ATTRS:
		{
			id:{ value:0 },
			login_name: { value:0 },
			color :{ value:0 }
		}
	});
	Y.PlayerView = Y.Base.create('playerview',Y.View,[],
	{
		pion:null,
		imgpiece:null,
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
				var mycol = this.get('model').get('color');
				if (id == game.players.self.id && game.players.self.host)
				{
					src ='littlecrown.png';
				}
				

				if (mycol==undefined) mycol=0
				colimg = colororder[mycol]
				
				var imgcrown = '<img style="margin-left:14px; margin-bottom:24px;" id="ready_'+m.get('id')+'" src="./images/'+src+'"/>';
				var imgpiece = '<img id="color_'+m.get('id')+'" src="./images/p_'+colimg+'.png" style="left:0px; top:0px; width:'+(pionw-13)+'px; height:'+(pionh-10)+'px;"/>'

				
				c.append('<div class="playerlistentry"><div id="playername_'+m.get('id')+'" class="'+('playerlistentryname_green')+' playernameentery">'+m.get('login_name')+'</div>'+imgpiece+imgcrown+'</div>');

				this.imgpiece = c.one('#color_'+m.get('id'))
				this.imgcrown = c.one('#ready_'+m.get('id'))
				//Y.log('imgpiece:'+this.imgpiece)
				
				if (game.players.self.host)
				{
					par = this;
					this.get('container').setStyle('cursor','pointer');
					c.one('.playerlistentry').on('mousedown',function(e)
					{
						if (playerlist_clickblock)
						{
							e.preventDefault();
							return
						}
						playerlist_clickblock=true;
						colorchooser.current_player = m.get('id')
						colorchooser.get('container').setStyle('display','block');
						colorchooser.get('container').setStyle('top', e.pageY-14);
						colorchooser.get('container').setStyle('left',176);
					});
					this.clickadded = true
				}				
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
				this.get('container').one('.playerlistentry').on('mousedown',function(e)
				{
					if (playerlist_clickblock)
					{
						e.preventDefault();
						return
					}
					playerlist_clickblock=true;
					if (!colorchooser || colorchooser==undefined)
					{
						colorchooser = new Y.ColorChooserView();
						colorchooser.get('container').setStyles({left:100,top:100,position:'absolute',display:'none'})
						thisapp.get('activeView').get('container').append(colorchooser.get('container'));						
					}
					colorchooser.current_player = m.get('id')
					colorchooser.get('container').setStyle('display','block');
					colorchooser.get('container').setStyle('top', e.pageY-14);
					colorchooser.get('container').setStyle('left',176);
				});
				this.clickadded = true
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
		changePlayerColor : function(pid,col)
		{
			var tthis = this
			this.playerlist.each(function(model,ind,thislist){

				if (model.get('id')==pid)
				{
					tthis.playerViews[pid].imgpiece.set('src','./images/p_'+colororder[col]+'.png')
					tthis.playerViews[pid].render()
				}
			});			
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