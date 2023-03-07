YUI.add("pion", function(Y) {
	
	var parrframe = parent;
	var parrapp = parent.app.get('activeView');
	
	Y.Pion = new Y.Base.create('pion',Y.Model,[],
	{
		ATTRS:
		{
			color:{ value:0 },
			x: { value:0 },
			y: { value:0 },
			width: { value: 0 },
			height: { value: 0 },
			id: { value: 0 },
			order: { value: 0 },
		}
	});

	Y.PionView = Y.Base.create('pionview',Y.View,[],
	{
		imgnode:null,
		canplay:0,
		initializer: function()
		{
			var m = this.get('model');
			var c = this.get('container');
			c.setStyle('zIndex','30');
			this.imgnode = Y.Node.create('<img width='+m.get('width')+' height='+m.get('height')+'  src="./images/p_'+m.get('color')+'.png">')
			c.setStyles({ position:'absolute',left:m.get('x'),top:m.get('y')})
			c.append(this.imgnode)
			var par = this

			dd = new Y.DD.Drag({
					node: c
				});
			dd.on('drag:start', function(e) {
				c.setStyle('zIndex',440);
				var notmine = 0;
				if (playerByPionId[m.get('id')]!=players_info[game.players.self.id])
					notmine=1;
				if (!myturn || secondstep==0 || notmine || par.canplay==0)
				{
					e.cancelBubble = true;
					return;
				}
				
				
			});
			dd.on('drag:click', function(e) {
				c.setStyle('zIndex',440);
				var notmine = 0;
				if (playerByPionId[m.get('id')]!=players_info[game.players.self.id])
					notmine=1;
				if (!myturn || secondstep==0 || notmine || par.canplay==0)
				{
					e.cancelBubble = true;
					return;
				}
				
			});
			dd.on('drag:drag', function(e) {
				var notmine = 0;
				//Y.log('style:'+c.one('img').getStyle('zIndex'))
				if (playerByPionId[m.get('id')]!=players_info[game.players.self.id])
					notmine=1;
				if (!myturn || secondstep==0 || notmine || par.canplay==0)
				{
					e.cancelBubble = true;
					return;
				}
				
				//c.setStyle('zIndex','440');
			});
			var thiss = this;
			dd.on('drag:end', function(e) {
				
				c.setStyle('zIndex',30);
				var notmine = 0;
				if (playerByPionId[m.get('id')]!=game.players.self.id)
					notmine=1;
				if (!myturn || secondstep==0 || notmine || par.canplay==0)
				{
					//Y.log('secondstep:'+secondstep+' notmine:'+notmine+' par.canplay:'+par.canplay)
					thiss.moveToCell(thiss.getCell(),0)
					e.cancelBubble = true;
					return;
				}
				
				var ddd = this.get('node');
				var newx = ddd.getXY()[0];
			 	var newy = ddd.getXY()[1];
			 	//var cellid = boardview.gridview.getCellByPos([newx,newy])
			 	var cellid = boardview.gridview.getCellByPosWide([newx,newy])
			 	playok = false;
			 
			 	for (var i in possible_moves)
			 	{
					if (possible_moves.hasOwnProperty(i))
					{
						if (i==m.get('id') && cellid==possible_moves[i])
							playok=true;

					}
				}

				if (!playok)
				{
					
					unlockwrong=1;
					thiss.moveToCell(thiss.getCell(),0)
					parrapp.playAudio(GAME_NAME,'wrong')
					e.cancelBubble = true;
					return;
				}
				else
				{
					
					secondstep=0;
			 		returntohomedat = 0
			 		if (pionsMap[cellid]!=undefined && pionsMap[cellid]!=0)
			 		{

			 			parrapp.playAudio(GAME_NAME,'eat')
						boardview.triggerReturnHome(pionsMap[cellid]);
						returntohomedat = 1
					}

					var thiscellid = pionsMapGridCell[m.get('id')]
					var isAtGoalBefore = thiss.isAtGoal();

					thiss.moveToCell(cellid,0)

					var player_id = playerByPionId[m.get('id')];
					var plpions = playerpionviews[player_id]
					if (thiss.isAtGoal() && !isAtGoalBefore)
					{
						parrapp.playAudio(GAME_NAME,'ingoal')
					}
					var allOnGoal = true;
					for (var i in plpions)
					{
						if (plpions.hasOwnProperty(i))
						{
							var pv = plpions[i]
							if (!pv.isAtGoal())
							{
								allOnGoal=false;
								break;
							}
						}
					}

					if (allOnGoal)
					{
						//TODO
						var tot = {}
						tot['from'] = thiscellid
						tot['to'] = cellid
						tot['returntohome'] = 0
						tot['playasecondtime'] = 0
						
						game.socket.send('c.sem.'+JSON.stringify(tot))  // show player end game message
						
						parrapp.playAudio(GAME_NAME,'win')
						
					}
					else
					{
						//TODO
						var tot = {}
						tot['from'] = thiscellid
						tot['to'] = cellid
						tot['returntohome'] = returntohomedat
						tot['playasecondtime'] = playasecondtime
						
						//Y.log('sending mov :'+JSON.stringify(tot))
						game.socket.send('c.mov.'+JSON.stringify(tot))  // execute player move
						
						
						//var dat = { 'from': thiscellid, 'to':cellid, 'returntohome':returntohomedat, 'playasecondtime':playasecondtime}
						//dispatcher.sendEvent(9, dat)
					}
				}
				c.setStyle('zIndex','30');
			});
			this.render()
		},
		isAtHome:function()
		{
			var m = this.get('model')
			cellid = pionsMapGridCell[m.get('id')]
			return boardview.gridview.isHome(cellid)

		},
		isAtGoal:function()
		{
			var m = this.get('model')
			cellid = pionsMapGridCell[m.get('id')]
			return boardview.gridview.isGoal(cellid)

		},
		getCell:function()
		{
			var m = this.get('model')
			cellid = pionsMapGridCell[m.get('id')]
			return cellid

		},
		moveToCell:function(cellid,noreplace)
		{
			var currentCell = this.getCell();
			if (noreplace==0)
			{
				pionsMap[currentCell] = 0;
			}
			pionsMap[cellid] = this;
			pionsMapGridCell[this.get('model').get('id')] = cellid;
			var pl = playerByPionId[this.get('model').get('id')];
			playerpionviews[pl][this.get('model').get('id')]=this;

			var a = boardview.gridview.getGridSquarePos(cellid)
			var adjx = 0;
			var adjy = 0;
			if (this.isAtHome())
			{
				var ad = boardview.getHomeAdjustments(pl,this.get('model').get('order'))
				adjx = ad[0];
				adjy = ad[1];
			}
			else if (this.isAtGoal())
			{
				var ad = boardview.getGoalAdjustments(pl,cellid)
				adjx = ad[0];
				adjy = ad[1];

			}
			else
			{
				var ad = boardview.getAdjustments(cellid)
				adjx = ad[0];
				adjy = ad[1]+boardoffsety;
			}
			//Y.log('before:'+parseInt(a[0])+','+parseInt(a[1]));


			var xx = parseInt(a[0])+parseInt(adjx);
			var yy = parseInt(a[1])+parseInt(adjy);
			//Y.log('after:'+xx+','+yy);
			this.get('container').setStyles({ left:xx+'px',top:yy+'px'})
			this.get('model').x = xx;
			this.get('model').y = yy;
            if (unlockwrong==0)
            {
            	parrapp.playAudio(GAME_NAME,'move')
			}
            unlockwrong=0;
		},
		render: function()
		{
			var m = this.get('model')
			var c = this.get('container');

			c.setStyles({ left:m.get('x'),top:m.get('y')})
			return this;
		}
	});

}, '1.0', {requires: ['gallery-audio','json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});