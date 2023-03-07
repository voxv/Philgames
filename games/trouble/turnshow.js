YUI.add("turnshow", function(Y) {

	Y.TurnshowPlayer = new Y.Base.create('turnshowplayer',Y.Model,[],
	{
		ATTRS:
		{
			color:{ value:0 },
			x: { value:0 },
			y: { value:0 },
			width: { value: 0 },
			height: { value: 0 },
			id: { value:0 },
			name: { value:0 }
		}
	});

	Y.TurnshowPlayerView = Y.Base.create('turnshowplayerview',Y.View,[],
	{
		resultdiv:null,
		initializer: function()
		{
			var m = this.get('model');
			var c = this.get('container');
			var n = Y.Node.create('<div id="turnshowplayer_'+m.get('id')+'" class="turnshowplayer_div"></div>');

			//n.setStyle('backgroundColor',colora[m.get('color')]);

			//Y.log('/images/b_'+colororder[m.get('color')]+'.png')
			var nn = Y.Node.create('<div class="innerPlayername" style="background-image:url(\'./images/b_'+colororder[m.get('color')]+'.png\');">'+m.get('name')+'</div>');
			var nn2 = this.resultdiv = Y.Node.create('<div class="innerScoreResult"><img src="./images/trans.png"/></div>');


			n.append(nn);
			n.append(nn2);

			c.append(n)

			this.render()
		},
		render: function()
		{
			return this;
		}
	});

	Y.TurnshowView = new Y.Base.create('turnshowview',Y.View,[],
	{
		playerviews:{},
		playerviewsByColors:{},
		totalplayers:0,
		divelement:null,
		initializer: function()
		{
			var m = this.get('model');
			var c = this.get('container');
			var n = this.divelement = Y.Node.create('<div class="turnshowview"> </div>');
			
			for (var i in players_info)
			{
				if (players_info.hasOwnProperty(i))
				{
					
					var pm = new Y.TurnshowPlayer({id:i,color:players_info[i]['color'],name:players_info[i]['login_name']});
					var pmv = new Y.TurnshowPlayerView({model:pm});
					this.playerviews[i] = pmv;
					this.playerviewsByColors[players_info[i]['color']] = pmv;
					//Y.log('adding pcv '+this.playerviewsByColors[players_info[i]['color']].get('model').get('id'))
					this.totalplayers++
					//n.append(pmv.get('container'));
				}
			}
			c.append(n)

			this.render()
		},
		renderalt:function()
		{

			if (currentTurn=='') return;
			var c = this.get('container');
			this.divelement.setHTML(' ');

			var currentPlayerView = null;
			if (pre_winner_act!='')
			{
				currentPlayerView = this.playerviews[pre_winner];
				//Y.log('act!');
			}
			else
			{
				currentPlayerView = this.playerviews[currentTurn];

			}

			var colcount = 0;
			var cm = currentPlayerView.get('model');
			var col = parseInt(cm.get('color'));
			var colcount = col;

			for (var i = 0 ; i < 4 ; i++)
			{

				var c = colcount%4;

				if (this.playerviewsByColors[c]==undefined) { colcount++; continue; }

				var plv = this.playerviewsByColors[c];
				var player_id = plv.get('model').get('id');

				if (is_pre==1)
				{
					var found = false;
					for (var j = 0 ; j < eliminated.length ; j++)
					{
						if (eliminated[j]==this.playerviewsByColors[c].get('model').get('id'))
						{
							found = true;
							break;
						}
					}

					if (pre_played[this.playerviewsByColors[c].get('model').get('id')]!=undefined && pre_played[this.playerviewsByColors[c].get('model').get('id')]!=0)
					{

						if (!found || has_winning==1)
						{
							//Y.log('PP:'+pre_played.toSource())
							plv.resultdiv.setHTML('<div align=center>'+pre_played[this.playerviewsByColors[c].get('model').get('id')]+'</div>')
						}
						else if (is_pre)
							plv.resultdiv.setHTML('<div align=center>-</div>')

					}
					else
					{
						if (currentTurn==this.playerviewsByColors[c].get('model').get('id'))
						{
							plv.resultdiv.setHTML('<img style="left:0px; top:0px; width:35px; height:20px; margin-top:20px; " src="./images/arrow.gif"/>')
							//boardview.lightUp(c);
							if (currentTurn==player_id)
								popitblock=0;
						}
						else
						{
							plv.resultdiv.setHTML('<img src="./images/trans.png"/>');
						}
					}

				}
				else
				{
						if (currentTurn==player_id && gameended!=1)
						{
							/*if (gameended==1)
							{
								plv.resultdiv.setHTML('<img style="left:0px; top:0px; width:35px; height:20px; margin-top:20px; " src="./images/arrow.gif"/>')
								
								var trophs = ['./images/trophy_gold.png','./images/trophy_silver.png','./images/trophy_bronze.png']
								Y.log('count trpheys1:'+counttrophees)
								if (counttrophees<3)
								{
									plv.resultdiv.setHTML('<img style="width:32px; height:38px; margin-top:10px;  margin-left:3px;" src="'+trophs[counttrophees]+'"/>')
								else
									plv.resultdiv.setHTML('<img src="./images/trans.png"/>')
							}
							else
							{
								plv.resultdiv.setHTML('<img style="left:0px; top:0px; width:35px; height:20px; margin-top:20px; " src="./images/arrow.gif"/>')
								//boardview.lightUp(c);
							}*/
							plv.resultdiv.setHTML('<img style="left:0px; top:0px; width:35px; height:20px; margin-top:20px; " src="./images/arrow.gif"/>')
						}
						else
						{
								if (wontrophees[player_id]!=undefined)
								{
									//Y.log('player '+player_id+' has a trpheys1:'+wontrophees[player_id]+ 'wontropheys:'+JSON.stringify(wontrophees))
									var p = wontrophees[player_id];
									var srct = '';
									if (p==1)
										srct = './images/trophy_gold.png';
									else if (p==2)
										srct = './images/trophy_silver.png';
									else if (p==3)
										srct = './images/trophy_bronze.png';
									else
										srct = './images/trans.png';

									plv.resultdiv.setHTML('<img style="width:32px; height:38px; margin-top:10px;  margin-left:3px;" src="'+srct+'"/>')
								}
								else
								{
									if (gameended==1)
									{
										//Y.log('player '+player_id+' had no trophet counttrophees:'+counttrophees)
										var trophs = ['./images/trophy_gold.png','./images/trophy_silver.png','./images/trophy_bronze.png']
										if (counttrophees<3)
											plv.resultdiv.setHTML('<img style="width:32px; height:38px; margin-top:10px;  margin-left:3px;" src="'+trophs[counttrophees]+'"/>')
										else
											plv.resultdiv.setHTML('<img src="./images/trans.png"/>')

									}
									else
										plv.resultdiv.setHTML('<img src="./images/trans.png"/>')
								}
						}



				}
				this.divelement.append(plv.get('container'))

				colcount++;
			}

			return this;

		},
		render: function()
		{
			return this.renderalt();
			if (currentTurn=='') return;
			var c = this.get('container');
			this.divelement.setHTML(' ');


			var currentPlayerView = this.playerviews[currentTurn];

			//if (is_pre==1)
			//{

				if (is_pre==1 && pre_played[currentTurn]!=0)
				{
					currentPlayerView.resultdiv.setHTML('<div align=center>'+pre_played[currentTurn]+'</div>')
				}
				else
				{
					currentPlayerView.resultdiv.setHTML('<img style="left:0px; top:0px; width:35px; height:20px; margin-top:20px; " src="./images/arrow.gif"/>')

					for (var i in this.playerviews)
					{
						if (this.playerviews.hasOwnProperty(i))
						{
							if (i!=currentTurn)
							{
								if (wontrophees[i]!=undefined)
								{
									var p = wontrophees[i];
									var srct = '';
									if (p==1)
										srct = './images/trophy_gold.png';
									else if (p==2)
										srct = './images/trophy_silver.png';
									else if (p==3)
										srct = './images/trophy_bronze.png';
									else
										srct = './images/trans.png';

									this.playerviews[i].resultdiv.setHTML('<img style="width:36px; height:50px; src="'+srct+'"/>')
								}
								else
									this.playerviews[i].resultdiv.setHTML('<img src="./images/trans.png"/>')

							}
							else
							{

							}
						}

					}
				}
			//}
			this.divelement.append(currentPlayerView.get('container'))

			var cm = currentPlayerView.get('model');
			var col = parseInt(cm.get('color'));
			var colcount = (col+1)%4;
			for (var i = 0 ; i < 4 ; i++)
			{
				//Y.log('DOING '+i);
				var c = colcount%4;
				//Y.log('c='+c+'   '+this.playerviewsByColors[c]);
				//Y.log('c='+c+' -- '+this.playerviewsByColors[c]);

				if (this.playerviewsByColors[c]==undefined) { colcount++; continue; }
				if (currentTurn==this.playerviewsByColors[c].get('model').get('id')) {  colcount++; continue; }
				//Y.log('ok');
				var plv = this.playerviewsByColors[c];

				if (is_pre==1)
				{
					var found = false;
					for (var j = 0 ; j < eliminated.length ; j++)
					{
						if (eliminated[j]==this.playerviewsByColors[c].get('model').get('id'))
						{
							found = true;
							break;
						}
					}
					if (pre_played[this.playerviewsByColors[c].get('model').get('id')]!=0)
					{
						//if (turnshowupdate_lock==0)
						//{
							if (!found)
								plv.resultdiv.setHTML('<div align=center>'+pre_played[this.playerviewsByColors[c].get('model').get('id')]+'</div>')
							else if (is_pre)
								plv.resultdiv.setHTML('<div align=center>-</div>')
						//}
					}
				}
				this.divelement.append(plv.get('container'))
				//Y.log('append currentturnid:'+plv.get('model').get('id'));
				colcount++;
			}

			//this.divelement.append(n);
			return this;
		}

	});
}, '1.0', {requires: ['json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});