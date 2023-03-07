YUI.add("selectr2", function(Y) {

	Y.SelectorPiece = new Y.Base.create('selectorpiece',Y.Model,[],
	{
		ATTRS:
		{
			id:{ value:0 },
			left: { value:0 },
			top:{ value:0 },
			width:{ value:0 },
			color:{ value:0 }
		}
	});
	Y.SelectorPieceView = Y.Base.create('selectorpieceview',Y.View,[],
	{
		initializer: function()
		{
			var c = this.get('container');
			var m = this.get('model');
			var n = Y.Node.create('<div class="selectorpieceview"></div>');
			n.setStyle('left',m.get('left')+'px');
			n.setStyle('top',m.get('top')+'px');
			n.setStyle('width',m.get('width')+'px');
			n.setStyle('height',m.get('width')+'px');
			var cl = m.get('color');
			//if (cl=='white' || cl=='green'  || cl=='yellow' || cl=='red' || cl=='black')
			//	n.append('<img src="images/full_'+cl+'.png">');
			//else
			n.append('<img style="margin-top:-10px; width:34px; height:46px;" src="./images/full_'+cl+'.png">');
			dd = new Y.DD.Drag({
					node: n
				});

			c.append(n);
			dd.on('drag:start', function(e) {
				if (colors_set || endgame!=0 || master_locked_in)
				{

					e.event.cancelBubble = true;
					return;
				}

			});
			dd.on('drag:mouseDown', function(e) {
				if (colors_set || endgame!=0 || master_locked_in)
				{
					if (master_locked_in)
						thisapp.get('activeView').sayNotMyTurn()
						//Y.log('colors_set:'+colors_set+' endgame:'+endgame+' master_locked_in:'+master_locked_in)
					e.event.cancelBubble = true;
					return;
				}

			});
			dd.on('drag:click', function(e) {
				if (colors_set || endgame!=0 || master_locked_in)
				{
					e.event.cancelBubble = true;
					return;
				}

			});
			dd.on('drag:drag', function(e) {
				if (colors_set || endgame!=0 || master_locked_in)
				{
					e.event.cancelBubble = true;
					return;
				}

			});
			var thiss = this;
			dd.on('drag:end', function(e) {
				if (colors_set || endgame!=0 || master_locked_in)
				{
					e.event.cancelBubble = true;
					return;
				}

				var ddd = this.get('node');
			 	var newx = ddd.getXY()[0];
			 	var newy = ddd.getXY()[1];
				var nid = boardview.grid.snap(newx,newy);

				if (nid>0)
				{

					boardview.addMasterPiece(nid,cl);


				}
				else
				{
						//Y.log('reset');
				}
					ddd.setStyles({
						 top: thiss.get('model').get('top'),
						 left: thiss.get('model').get('left')
					});
			});

		},
		render: function()
		{
			return this;
		}

	});
	Y.SelectorViewMaster = Y.Base.create('selectorviewmaster',Y.View,[],
	{
		initializer: function()
		{
			var c = this.get('container');
			var n = Y.Node.create('<div class="selectorviewmaster"></div>');
			n.append('<img style="margin-left:-5px; width:711px; margin-top:-42px; z-index:300; " src="./images/bg.png"/>');
			var w = 50;
			var c_red = new Y.SelectorPiece({id:1,left:35,top:3,width:w,color:'red'});
			var c_white = new Y.SelectorPiece({id:2,left:95,top:3,width:w,color:'white'});
			var c_blue = new Y.SelectorPiece({id:3,left:155,top:3,width:w,color:'blue'});
			var c_yellow = new Y.SelectorPiece({id:4,left:215,top:3,width:w,color:'yellow'});
			var c_green = new Y.SelectorPiece({id:5,left:275,top:3,width:w,color:'green'});
			var c_black = new Y.SelectorPiece({id:6,left:335,top:3,width:w,color:'black'});

			var v_red = new Y.SelectorPieceView({model:c_red});
			var v_white = new Y.SelectorPieceView({model:c_white});
			var v_blue = new Y.SelectorPieceView({model:c_blue});
			var v_yellow = new Y.SelectorPieceView({model:c_yellow});
			var v_green = new Y.SelectorPieceView({model:c_green});
			var v_black = new Y.SelectorPieceView({model:c_black});

			n.append(v_red.get('container'));
			n.append(v_white.get('container'));
			n.append(v_blue.get('container'));
			n.append(v_yellow.get('container'));
			n.append(v_green.get('container'));
			n.append(v_black.get('container'));
			c.append(n);


		},
		render: function()
		{
			return this;
		}
	});

	Y.SelectorPieceViewPlayer = Y.Base.create('selectorpieceviewplayer',Y.View,[],
	{
		initializer: function()
		{
			var c = this.get('container');
			var m = this.get('model');
			var n = Y.Node.create('<div class="selectorpieceview"></div>');
			n.setStyle('left',m.get('left')+'px');
			n.setStyle('top',m.get('top')+'px');
			n.setStyle('width',m.get('width')+'px');
			n.setStyle('height',m.get('width')+'px');
			var cl = m.get('color');
			n.append('<img style="margin-top:-10px; width:34px; height:46px;" src="./images/full_'+cl+'.png">');
			dd = new Y.DD.Drag({
					node: n
				});

			c.append(n);

			dd.on('drag:mouseDown', function(e) {
				if (!colors_set || endgame!=0)
				{
					e.event.cancelBubble = true;
					return;
				}
			});
			dd.on('drag:start', function(e) {
				if (!colors_set || endgame!=0)
				{
					e.event.cancelBubble = true;
					return;
				}
			});
			dd.on('drag:drag', function(e) {
				if (!colors_set || endgame!=0)
				{
					e.event.cancelBubble = true;
					return;
				}
			});
			var thiss = this;
			dd.on('drag:end', function(e) {
				if (!colors_set || endgame!=0)
				{
					e.event.cancelBubble = true;
					return;
				}
				var ddd = this.get('node');
			 	var newx = ddd.getXY()[0];
			 	var newy = ddd.getXY()[1];
				ddd.setStyles({
					top: thiss.get('model').get('top'),
					left: thiss.get('model').get('left')
				});
				var nid = boardviewplayer.grid.snap(newx,newy);

				if (nid>-1)
				{

					boardviewplayer.addPiece(nid,cl);
					var tot = {}
					tot['nid'] = nid;
					tot['cl'] = cl;

				}
				else
				{
						//Y.log('reset');
				}
			});

		},
		render: function()
		{
			return this;
		}

	});
	Y.SelectorViewPlayer = Y.Base.create('selectorviewplayer',Y.View,[],
	{
		initializer: function()
		{
			var c = this.get('container');
			var n = Y.Node.create('<div class="selectorviewplayer"></div>');
			n.append('<img style="width:708px; margin-left:-3px;  margin-top:-30px; z-index:300; " src="./images/bg.png"/>');
			var w = 50;
			var c_red = new Y.SelectorPiece({id:1,left:35,top:17,width:w,color:'red'});
			var c_white = new Y.SelectorPiece({id:2,left:95,top:17,width:w,color:'white'});
			var c_blue = new Y.SelectorPiece({id:3,left:155,top:17,width:w,color:'blue'});
			var c_yellow = new Y.SelectorPiece({id:4,left:215,top:17,width:w,color:'yellow'});
			var c_green = new Y.SelectorPiece({id:5,left:275,top:17,width:w,color:'green'});
			var c_black = new Y.SelectorPiece({id:6,left:335,top:17,width:w,color:'black'});

			var v_red = new Y.SelectorPieceViewPlayer({model:c_red});
			var v_white = new Y.SelectorPieceViewPlayer({model:c_white});
			var v_blue = new Y.SelectorPieceViewPlayer({model:c_blue});
			var v_yellow = new Y.SelectorPieceViewPlayer({model:c_yellow});
			var v_green = new Y.SelectorPieceViewPlayer({model:c_green});
			var v_black = new Y.SelectorPieceViewPlayer({model:c_black});

			n.append(v_red.get('container'));
			n.append(v_white.get('container'));
			n.append(v_blue.get('container'));
			n.append(v_yellow.get('container'));
			n.append(v_green.get('container'));
			n.append(v_black.get('container'));
			c.append(n);


		},
		render: function()
		{
			return this;
		}
	});
}, '1.0', {requires: ['json-parse','json-stringify','console','app','node','model','model-list','view', 'io','dd-constrain','dd-drag']});