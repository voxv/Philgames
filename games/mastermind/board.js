YUI.add("board", function(Y) {
var grid = [
				[47,9],[101,9],[156,10],[210,11],
				[47,62],[102,62],[156,63],[211,62],
				[45,116],[102,116],[157,116],[213,116],
				[45,170],[102,170],[157,170],[215,170],
				[44,228],[102,228],[159,228],[217,228],
				[43,286],[101,286],[160,286],[218,286],
				[42,346],[101,346],[160,346],[219,346],
				[41,410],[101,410],[161,410],[221,410],
				[39,475],[101,475],[162,475],[222,475],
				[37,540],[101,540],[163,540],[224,540],
				[33,662],[98,662],[162,662],[225,662],
			]

var gridplayer = [
				[133,90],[185,91],[237,92],[289,93],
				[132,142],[184,143],[237,144],[289,145],
				[130,194],[183,195],[238,196],[291,197],
				[128,247],[184,248],[241,249],[296,250],
				[126,300],[184,301],[243,302],[298,303],
				[125,355],[184,356],[244,357],[301,358],
				[124,417],[184,418],[245,419],[304,420],
				[122,479],[185,480],[247,481],[309,482],
				[120,549],[184,550],[247,551],[312,552],
				[118,622],[184,623],[250,624],[316,625],
				[143,9],[192,10],[242,12],[292,14],
			]

var gridmaster_small = [

				[298,530],[329,531],[300,559],[330,559],
				[296,465],[326,465],[297,491],[327,491],
				[294,401],[324,401],[295,427],[325,427],
				[290,339],[320,339],[291,364],[321,364],
				[288,279],[317,279],[288,303],[317,303],
				[286,222],[314,222],[286,246],[314,246],
				[284,165],[312,165],[284,188],[312,188],
				[281,112],[309,112],[282,134],[310,134],
				[278,59],[306,59],[280,81],[308,81],
				[276,8],[303,8],[278,29],[305,29],

]
var gridplayer_small = [

				[44,614],[77,615],[43,645],[76,645],
				[47,541],[80,542],[46,571],[79,571],
				[51,472],[82,472],[50,501],[82,501],
				[55,408],[85,408],[54,434],[84,434],
				[57,346],[87,347],[56,372],[86,373],
				[61,286],[90,286],[59,311],[89,312],
				[63,231],[92,231],[63,254],[92,254],
				[66,178],[94,179],[65,200],[93,200],
				[70,128],[97,128],[68,149],[96,150],
				[73,81],[99,81],[71,101],[98,102],

]

var parrframe = parent;

	Y.BoardViewMaster = Y.Base.create('boardviewmaster',Y.View,[],
	{
		grid:null,
		currentSelection:{},
		totalSelected:0,
		row_pieces:[],
		initializer: function()
		{
			var c = this.get('container');

			c.append('<img src="./images/s_board.png"/>');
			this.grid = new Y.BoardGridMaster();
			c.append(this.grid.get('container'));

		},
		showWin: function()
		{
				Y.one('#placement_message').setStyle('display','none');
				var n = Y.one('#winlose');
				n.setHTML('<div><div style="clear:both"><b>'+players_info[otherplayerid]['login_name']+' a gagn&eacute; en '+(inv_lookup[(current_row+1)]+1)+' essais! </b></div><div style="width:610px; height:343px;"><img src="./images/brain.jpg"/></div></div>');
				n.setStyle('display','block');
				var cimg = Y.one('#cachette_master').one('img');
				cimg.setAttribute('src','./images/cover_master_open.png');
				Y.one('#cachette_master').setStyle('left','475');
				Y.one('#cachette_master').setStyle('top','575');
				setTimeout('hidewinlose()',loopback_delay);
				parrframe.main_instance.reconnected = true;
				endgameshown = true;
		},
		showLose: function()
		{
				Y.one('#placement_message').setStyle('display','none');
				var n = Y.one('#winlose');
				n.setHTML('<div><div style="clear:both"><b>'+players_info[otherplayerid]['login_name']+' a perdu! </b></div><div style="width:610px; height:343px;"><img style="margin-top:70px;" src="./images/brain_lose.png"/></div></div>');
				n.setStyle('display','block');
				var cimg = Y.one('#cachette_master').one('img');
				cimg.setAttribute('src','./images/cover_master_open.png');
				Y.one('#cachette_master').setStyle('left','475');
				Y.one('#cachette_master').setStyle('top','575');
				setTimeout('hidewinlose()',loopback_delay);
				parrframe.main_instance.reconnected = true;
				endgameshown = true;

		},
		addMasterPiece: function(nid,col)
		{
			var c = this.get('container');

			if (this.currentSelection[nid]!=undefined) return
			this.currentSelection[nid] =col;
			var img = Y.Node.create('<img style="position:absolute; z-index:80;" src="./images/s_'+col+'.png"/>');

			var s = this.currentSelection[nid];
			var tthis = this;

			img.on('click',function(e)
			{
				if (colors_set) return;

				var n = e.currentTarget;
				tthis.totalSelected--;
				tthis.currentSelection[nid]=undefined;
				n.get('parentNode').removeChild(n);
				if (tthis.totalSelected<4)
				{
					masterstart_button.setStyle('cursor','default');
					masterstart_button.setStyle('backgroundColor','#774433');
					masterstart_button.setStyle('fontWeight','plain');
					masterstart_button.setStyle('color','#aaaaaa');
					masterstart_button_enable = false;
				}

			});
			var row = this.grid.gridrows[10]
			var dims = row.getPos(nid)

			img.setStyle('left',dims[0]+14)
			img.setStyle('top',dims[1]+14)
			c.append(img);
			this.totalSelected++;
			if (this.totalSelected>3)
			{
				masterstart_button.setStyle('cursor','pointer');
				masterstart_button.setStyle('backgroundColor','#eeee00');
				masterstart_button.setStyle('fontWeight','bold');
				masterstart_button.setStyle('color','#000066');
				masterstart_button_enable = true;
			}
		},
		addPiece: function(nid,col)
		{

			var c = this.get('container');


			var row = this.grid.gridrows[inv_lookup[current_row]]
			//Y.log('id='+nid+' id inv='+id_inv[nid])
			var dims = row.getPos(id_inv[nid])
			//Y.log(dims.toSource())
			if (dims.length==0) return;

			var img = Y.Node.create('<img style="position:absolute;" src="./images/s_'+col+'.png"/>');

			//Y.log('DIMS: '+dims.toSource())
			var l = dims[0]+5
			var t = dims[1]+5
			if (lookupAdjustementsMaster[id_inv[nid]]!= undefined)
			{
				var look = lookupAdjustementsMaster[id_inv[nid]]
				l+=look[0]
				t+=look[1]
				if (look[2]!=0)
				{
					var w = 34;

					img.setStyle('width',w-look[2])
					img.setStyle('height',w-look[2])
				}
			}
			img.setStyle('left',l)
			img.setStyle('top',t)
			this.row_pieces.push(img);

			c.append(img);


		},
		updateCurrentRow: function()
		{

			var tthis = this
			for (var i = 0 ; i < this.row_pieces.length ; i++)
			{
				//Y.log(this.row_pieces[i]);
				//Y.log(this.row_pieces[i].get('parentNode'));
				this.row_pieces[i].get('parentNode').removeChild(this.row_pieces[i]);

			}
			this.row_pieces = [];

			var a = Y.JSON.parse(current_row_str);
			//Y.log('WWWTTTTTTTTTTTTTFFFFFFFFFFFF');
		//	Y.log('fsdfsdf  '+a.toSource());
			for (var i in a)
			{
				if (a.hasOwnProperty(i))
				{

					this.addPiece(i,a[i]);

				}

			}



		},
		adjustSmall: function(row)
		{
			var w = 28;
			var wg = [28,28,27,27,26,25,25,24,23,23]
			return wg[row];
		},
		addHints:function()
		{
			var a = Y.JSON.parse(current_hints_str);
			var w = a[1];
			var b = a[0];

			var count = current_row*4;
			var img = null;
			for (var i = 0 ; i < b ; i++)
			{
				img = Y.Node.create('<img style="position:absolute;" src="./images/s_l_black_fix.png"/>');
				var dims = gridmaster_small[count++];
				//Y.log('dims:'+dims.toSource())
				img.setStyle('left',dims[0]);
				img.setStyle('top',dims[1]);
				img.setStyle('width',this.adjustSmall(current_row));
				this.get('container').append(img);
			}
			for (var i = 0 ; i < w ; i++)
			{
				img = Y.Node.create('<img style="position:absolute;" src="./images/s_l_white_fix.png"/>');
				var dims = gridmaster_small[count++];
				img.setStyle('left',dims[0]);
				img.setStyle('top',dims[1]);
				img.setStyle('width',this.adjustSmall(current_row));
				this.get('container').append(img);
			}
			//Y.log('Hints: '+a.toSource());

		},
		render: function()
		{
			return this;
		}
	});
	Y.GridSquare = new Y.Base.create('gridsquare',Y.Model,[],
	{
		ATTRS:
		{
			id:{ value:0 },
			left: { value:0 },
			top:{ value:0 },
			width:{ value:0 }
		}
	});
	Y.GridSquareView = Y.Base.create('gridsquareview',Y.View,[],
	{
		initializer: function()
		{
			var c = this.get('container');
			var m = this.get('model');
			var offset = 8
			var n = Y.Node.create('<div style="width:'+m.get('width')+'px; height:'+m.get('width')+'px; opacity:0; position:absolute; background-color:#33ff5f; top:'+(m.get('top')-offset)+'px; left:'+(m.get('left')-offset)+'px;"></div>');
			//Y.log('<div style="width:'+m.get('width')+'px; height:'+m.get('width')+'px; opacity:0.3; position:absolute; background-color:#33ff5f; top:'+m.get('top')+'px; left:'+m.get('left')+'px;"></div>')
			n.setHTML(m.get('id'));
			c.append(n);

		},
		render: function()
		{
			return this;
		},
		contain: function(l,t)
		{
			var m = this.get('model');


			var ll = m.get('left')+460
			var tt = m.get('top')+10
			var ww = m.get('width')
			//Y.log('if '+t+'>'+tt+' && '+t+'<'+(tt+ww))
			var rr = false;
			//if (t>tt && t < (tt+ww) && l>ll && l < (ll+ww)) Y.log('OK')

			if (l>ll && l < (ll+ww) && t>tt && t < (tt+ww))
			{

				return true
			}
			return false;
		}
	});
	Y.GridRow = new Y.Base.create('gridrow',Y.Model,[],
	{
		ATTRS:
		{
			id:{ value:0 },
		}
	});
	Y.GridRowView = Y.Base.create('gridrowview',Y.View,[],
	{
		gridsquares:[],
		initializer: function()
		{
			var c = this.get('container');
			var m = this.get('model');
			var i = m.get('id')*4;
			var id = m.get('id');
			this.gridsquares = []
			for (var j = i ; j < (i+4) ; j++)
			{
				var g = grid[j];
				var w = 50;

				if (id>1)
					w=52
				if (id>=5)
					w=57
				if (id>6)
					w=58
				if (id>7)
					w=59
				if (id>8)
					w=60

				var sv = new Y.GridSquareView({model:new Y.GridSquare({id:j,left:g[0],top:g[1],width:w})})
				this.gridsquares.push(sv);

				c.append(sv.get('container'));
			}

		},
		getPos: function(nid)
		{
			var dims = []
			//Y.log(this.gridsquares.toSource())
			Y.Array.each(this.gridsquares, function(gs){

				//Y.log('modelid:'+gs.get('model').get('id')+'=='+nid+'?')
				if (gs.get('model').get('id')==nid)
				{
					dims = [gs.get('model').get('left'),gs.get('model').get('top')]
				}

			});

			return dims;

		},
		contain: function(l,t)
		{
			var nid = 0

			Y.Array.each(this.gridsquares, function(gs){


				if (gs.contain(l,t))
				{

					nid = gs.get('model').get('id')
				}

			});

			return nid;
		},
		render: function()
		{
			return this;
		}

	});
	Y.BoardGridMaster = Y.Base.create('boardgridmaster',Y.View,[],
	{

		gridrows:[],
		initializer: function()
		{
			var c = this.get('container');

			for (var i = 0 ; i < 11 ; i++)
			{
				var gr = new Y.GridRow({id:i});

				var grv = new Y.GridRowView({model:gr});

				this.gridrows.push(grv);
				c.append(grv.get('container'));

			}

		},
		snap: function(l,t)
		{
			var m_row = this.gridrows[10];
			var nid = m_row.contain(l,t);
			return nid;
		},
		render: function()
		{
			return this;
		}
	});
	Y.BoardViewPlayer = Y.Base.create('boardviewplayer',Y.View,[],
	{
		grid:null,
		currentSelection:{},
		totalSelected:0,
		initializer: function()
		{
			var c = this.get('container');
			this.grid = new Y.BoardGridPlayer();
			c.append('<img src="./images/s_board_player.png"/>');
			c.append(this.grid.get('container'));

		},
		showWin: function()
		{
				endgameshown = true;
				Y.one('#placement_message').setStyle('display','none');
				var n = Y.one('#winlose');
				n.setHTML('<div><div style="clear:both"><b>Bravo! Tu Gagnes en '+(inv_lookup[(current_row+1)]+1)+' essais!</b></div><div style="width:610px; height:343px;"><img src="./images/brain.jpg"/></div></div>');
				n.setStyle('display','block');
				setTimeout('hidewinlose()',loopback_delay);
				var ind = 40;
				var count = 3;

				for (var i = 0 ; i < 4 ; i++)
				{

					img = Y.Node.create('<img style="position:absolute;" src="./images/s_'+solution[count--]+'.png"/>');
					img.setStyle('left',gridplayer[(ind+i)][0]);
					img.setStyle('top',gridplayer[(ind+i)][1]);
					img.setStyle('width','30');
					img.setStyle('height','30');
					this.get('container').append(img);
				}
				var cimg = Y.one('#cachette').one('img');
				cimg.setAttribute('src','./images/cover_player_open.png');
				Y.one('#cachette').setStyle('top','14');
				Y.one('#cachette').setStyle('left','583');
				parrframe.main_instance.reconnected = true;
				//Y.one('#cachette').setStyle('display','none');
		},
		showLose: function()
		{
				endgameshown = true;
				Y.one('#placement_message').setStyle('display','none');
				var n = Y.one('#winlose');
				n.setHTML('<div><div style="clear:both"><b>Tu as perdu! </b></div><div style="width:610px; height:343px;"><img style="margin-top:70px;" src="./images/brain_lose.png"/></div></div>');
				n.setStyle('display','block');
				setTimeout('hidewinlose()',loopback_delay);
				var ind = 40;
				var count = 3;
				for (var i = 0 ; i < 4 ; i++)
				{
					img = Y.Node.create('<img style="position:absolute;" src="./images/s_'+solution[count--]+'.png"/>');
					img.setStyle('left',gridplayer[(ind+i)][0]);
					img.setStyle('top',gridplayer[(ind+i)][1]);
					img.setStyle('width','30');
					img.setStyle('height','30');
					this.get('container').append(img);
				}
				var cimg = Y.one('#cachette').one('img');
				cimg.setAttribute('src','./images/cover_player_open.png');
				Y.one('#cachette').setStyle('top','14');
				Y.one('#cachette').setStyle('left','583');
				parrframe.main_instance.reconnected = true;
				//Y.one('#cachette').setStyle('display','none');
		},
		adjustSmall:function(row)
		{
			var w = 28;
			var wg = [29,29,28,27,26,26,25,24,23,23]
			return wg[row];


		},
		addHints:function()
		{
			var a = Y.JSON.parse(current_hints_str);
			var w = a[1];
			var b = a[0];

			var current_row_inv = inv_lookup[(current_row+1)];


			var count = inv_lookup[(current_row+1)]*4;
			var img = null;

			for (var i = 0 ; i < b ; i++)
			{
				img = Y.Node.create('<img style="position:absolute;" src="./images/s_l_black_fix.png"/>');

				var dims = gridplayer_small[count++];

				img.setStyle('left',dims[0]);
				img.setStyle('top',dims[1]);
				img.setStyle('width',this.adjustSmall(current_row_inv));
				this.get('container').append(img);
			}
			for (var i = 0 ; i < w ; i++)
			{

				img = Y.Node.create('<img style="position:absolute;" src="./images/s_l_white_fix.png"/>');
				var dims = gridplayer_small[count++];
				img.setStyle('left',dims[0]);
				img.setStyle('top',dims[1]);
				img.setStyle('width',this.adjustSmall(current_row_inv));
				this.get('container').append(img);
			}
			//Y.log('Hints: '+a.toSource());

		},
		addPiece: function(nid,col)
		{
			var c = this.get('container');

			if (this.currentSelection[nid]!=undefined) return
			this.currentSelection[nid] =col;
			var img = Y.Node.create('<img id="'+current_row+'" style="position:absolute;" src="./images/s_'+col+'.png"/>');

			var s = this.currentSelection[nid];
			var tthis = this;
			img.on('click',function(e)
			{

				var n = e.currentTarget;
				var id = n.get('id');
				if (id!=current_row) return;
				tthis.totalSelected--;
				//tthis.currentSelection[nid]=undefined;
				delete tthis.currentSelection[nid];
				n.get('parentNode').removeChild(n);
				if (tthis.totalSelected<4)
				{
					playerstart_button.setStyle('cursor','default');
					playerstart_button.setStyle('backgroundColor','#774433');
					playerstart_button.setStyle('fontWeight','plain');
					playerstart_button.setStyle('color','#aaaaaa');
					playerstart_button_enable = false;
				}
				tthis.updateRows();
			});
			var row = this.grid.gridrows[current_row]
			var dims = row.getPos(nid)

			var l = dims[0]+5
			var t = dims[1]+5
			if (lookupAdjustements[nid]!= undefined)
			{
				var look = lookupAdjustements[nid]
				l+=look[0]
				t+=look[1]
				if (look[2]!=0)
				{
					var w = 34;

					img.setStyle('width',w-look[2])
					img.setStyle('height',w-look[2])
				}
			}
			img.setStyle('left',l)
			img.setStyle('top',t)
			c.append(img);
			this.totalSelected++;
			if (this.totalSelected>3)
			{
				playerstart_button.setStyle('cursor','pointer');
				playerstart_button.setStyle('backgroundColor','#eeee00');
				playerstart_button.setStyle('fontWeight','bold');
				playerstart_button.setStyle('color','#000066');
				playerstart_button_enable = true;
			}

			this.updateRows();


		},
		updateRows: function()
		{
			game.socket.send('c.ur.'+JSON.stringify(this.currentSelection))
			// TODO
			/*data = { 'thisplayer':playerInfo['id'], 'action':'updaterow', 'rows':Y.JSON.stringify(this.currentSelection)}

			Y.io('index.ajax.php', {
				method: 'POST',
				data: data,
				on: {
					success: function(){  },
					failure: function(transactionid, response, arguments){  }
				}
			});*/
		},
		render: function()
		{
			return this;
		}
	});
	Y.BoardGridPlayer = Y.Base.create('boardgridplayer',Y.View,[],
	{

		gridrows:[],
		initializer: function()
		{
			var c = this.get('container');

			for (var i = 0 ; i < 11 ; i++)
			{
				var gr = new Y.GridRow({id:i});

				var grv = new Y.GridRowViewPlayer({model:gr});

				this.gridrows.push(grv);
				c.append(grv.get('container'));

			}

		},
		snap: function(l,t)
		{
			var m_row = this.gridrows[current_row];
			var nid = m_row.contain(l,t);
			return nid;
		},
		render: function()
		{
			return this;
		}
	});


	Y.GridRowViewPlayer = Y.Base.create('gridrowviewplayer',Y.View,[],
	{
		gridsquares:[],
		initializer: function()
		{
			var c = this.get('container');
			var m = this.get('model');
			var i = m.get('id')*4;
			var id = m.get('id');
			this.gridsquares = []
			for (var j = i ; j < (i+4) ; j++)
			{
				var g = gridplayer[j];
				var w = 49;

				if (id>1)
					w=50
				if (id>3)
					w=53
				if (id>=5)
					w=56
				if (id>6)
					w=61
				if (id>7)
					w=62
				if (id>8)
					w=64
				if (id==10)
					w=48
				var sv = new Y.GridSquareView({model:new Y.GridSquare({id:j,left:g[0],top:g[1],width:w})})

				this.gridsquares.push(sv);

				c.append(sv.get('container'));
			}

		},
		getPos: function(nid)
		{
			var dims = []

			Y.Array.each(this.gridsquares, function(gs){


				if (gs.get('model').get('id')==nid)
				{
					dims = [gs.get('model').get('left'),gs.get('model').get('top')]
				}

			});

			return dims;

		},
		contain: function(l,t)
		{
			var nid = -1

			Y.Array.each(this.gridsquares, function(gs){


				if (gs.contain(l,t))
				{

					nid = gs.get('model').get('id')
				}

			});

			return nid;
		},
		render: function()
		{
			return this;
		}

	});
}, '1.0', {requires: ['selectr2','json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});