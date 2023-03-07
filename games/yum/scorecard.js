YUI.add("scorecard", function(Y) {

	var parrframe = parent;
	var parrapp = parent.app.get('activeView');

	Y.Scorecard = new Y.Base.create('scorecard',Y.Model,[],
	{
		ATTRS:
		{
			x: { value:0 },
			y: { value:0 },
			width: { value:0 },
			height: { value:0 }
		}
	});


	Y.ScorecardView = Y.Base.create('scorecardview',Y.View,[],
	{
		subturn: 1,
		columns:{},
		mycolumn:null,
		initializer: function()
		{
			var m = this.get('model')
			var c = this.get('container');
			var w = m.get('width')/3

			c.setStyles({position:'absolute',left:m.get('x'),top:m.get('y'),width:m.get('width'),height:m.get('height')})
			this.subturn=1

			var cellWidth = m.get('width')/3


			var scc = new Y.ScoreCardColumn({x:0,y:0,width:w,height:m.get('height'),id:0,cellHeight:40})
			var sccv = new Y.ScoreCardColumnView({model:scc})
			c.append(sccv.get('container'))

			count = 0

			var scc = new Y.ScoreCardColumn({x:cellWidth+(w-100)*count,y:0,width:w-100,height:m.get('height'),id:myplayerid,cellHeight:40})
			var sccv = new Y.ScoreCardColumnView({model:scc})
			c.append(sccv.get('container'))
			this.mycolumn = this.columns[myplayerid] = sccv
			count++

			/*if (game.players.self.host)
			this.columns[myplayerid].updateScores({1:10,0:5,2:15,3:20,4:25,5:25,6:6,7:7,8:8,9:9,10:10,11:11,12:12})
			else
			this.columns[myplayerid].updateScores({1:10,0:5,2:15,3:20,4:25,5:30,6:6,7:7,8:8,9:9,10:10,11:11,12:12})*/

			for (var i in players_info)
			{
				if (players_info.hasOwnProperty(i))
				{
					if (i==myplayerid) continue

					var scc = new Y.ScoreCardColumn({x:cellWidth+(w-100)*count,y:0,width:w-100,height:m.get('height'),id:i,cellHeight:40})
					var sccv = new Y.ScoreCardColumnView({model:scc})
					c.append(sccv.get('container'))

					this.columns[i] = sccv
					//this.columns[i].updateScores({1:10,0:5,2:15,3:20,4:25,5:30,6:6,7:7,8:8,9:9,10:10,11:11,12:12})

					if (i==myplayerid) { this.mycolumn = sccv }
					count++
				}
			}

			//c.append(scoresPanel)
		},
		showBonuses:function(bonuses)
		{
			for (var i in bonuses)
			{
				if (bonuses.hasOwnProperty(i))
				{
					var col = this.columns[i]
					if (bonuses[i]>=63)
					{
						col.showBonus(25)
					}
					else
					{
						col.showBonus(0)
					}
				}
			}

		},
		showUpperScores:function(scores)
		{
			for (var i in scores)
			{
				if (scores.hasOwnProperty(i))
				{

					var col = this.columns[i]
					col.showUpperScore(scores[i])
				}

			}
		},
		showGrandTotal:function(scores)
		{
			var highest = ''
			var current = 0
			var firstscore = 0
			var is_tie = false;
			for (var i in scores)
			{
				if (scores.hasOwnProperty(i))
				{
					var val = scores[i]
					if (firstscore==0)
						firstscore = val
					else
					{
						if (firstscore==val)
						{
							is_tie = true;
							break;
						}
					}
					if (val>current)
					{
						highest = i
						current = val
					}
				}
			}

			if (is_tie)
				thisapp.get('activeView').sayPerma('&Eacute;galit&eacute;!')
			else
				thisapp.get('activeView').sayPerma('F&eacute;licitations '+players_info[highest]['login_name'])

			for (var i in scores)
			{
				if (scores.hasOwnProperty(i))
				{

					var col = this.columns[i]
					col.showGrandTotal(scores[i],highest,is_tie)
				}

			}
		},
		updateScores:function(tot)
		{

			for (var i in tot)
			{
				if (tot.hasOwnProperty(i))
				{

					var theid = '';

					if (i=='host')
					{
						if (game.players.self.host)
							theid = myplayerid
						else
							theid = otherplayerid

					}
					else
					{
						if (game.players.self.host)
							theid = otherplayerid
						else
							theid = myplayerid
					}


					var col = this.columns[theid]

					col.updateScores(tot[i])
				}

			}

		},
		updateCurrentPreview:function(tot)
		{
			firstThrowDone = true
			//this.columns[playerInfo['id']].updateCurrentResult(tot)
			this.mycolumn.updateCurrentPreview(tot,true)

		},
		render: function()
		{
			var m = this.get('model')
			var c = this.get('container');


			return this;
		}
	});

	Y.ScoreCardEntry = new Y.Base.create('scorecardentry',Y.Model,[],
	{
		ATTRS:
		{
			x: { value:0 },
			y: { value:0 },
			width: { value:0 },
			height: { value:0 },
			id: { value:0 },
			score: { value:0 },
			completed: { value:0 },
			player_id: { value:0 }
		}

	});

	Y.ScoreCardEntryView = Y.Base.create('scorecardentryview',Y.View,[],
	{

		initializer: function()
		{
			var m = this.get('model')
			var c = this.get('container');

			c.setStyles({cursor:'pointer',position:'absolute',left:0,top:m.get('y'),width:m.get('width'),height:m.get('height'), backgroundColor:'#aaaa22', borderBottom:'solid 1px #000000', borderTop:'solid 1px #000000', fontSize:'21px', lineHeight:'38px'})

			if (m.get('id')==6 || m.get('id')==7 || m.get('id')==14 || m.get('player_id')!=myplayerid || m.get('completed')) c.setStyle('cursor','auto')
			var par = this
			c.on('mouseover',function(e)
			{

				var m = par.get('model')

				if (m.get('id')==6 || m.get('id')==7 || m.get('id')==14 || m.get('player_id')!=myplayerid || m.get('completed') || !firstThrowDone) return
				if (!myturn) return
				par.get('container').setStyle('backgroundColor','#ffff00');

			});
			c.on('mouseout',function(e)
			{
				var m = par.get('model')
				if (m.get('id')==6 || m.get('id')==7 || m.get('id')==14 || m.get('player_id')!=myplayerid || m.get('completed') || !firstThrowDone) return
				if (!myturn) return
				par.get('container').setStyle('backgroundColor','#eeee33');

			});
			c.on('click',function(e)
			{
				if (!myturn) return
				var m = par.get('model')
				var c = par.get('container');
				var id = m.get('id')
				if (m.get('id')==6 || m.get('id')==7 || m.get('id')==14 || m.get('player_id')!=myplayerid || m.get('completed')) return
				var score = m.get('score')
				if (score<0) return
				///TODO
				/*data = { 'thisplayer':playerInfo['id'], 'action':'endturn', 'cellscore':Y.JSON.stringify([id,score]) }
				Y.io('index.ajax.php', {
					method: 'POST',
					data: data,
					on: {
						success: handleResponse,
					}
				});*/
				game.socket.send('c.et.'+JSON.stringify({'cellscore':[id,score]}))
				thisapp.get('activeView').scorecard.columns[myplayerid].resetColor()
				thisapp.get('activeView').scorecard.columns[myplayerid].get('model').set('inPreview',0)
				if (totalPlayers==1)
					currentTurn='bullllshhhiiittt'
				myturn= false
			});
		},

		render: function()
		{
			var m = this.get('model')
			var c = this.get('container');


			return this;
		}
	});


	Y.ScoreCardColumn = new Y.Base.create('scorecardcolumn',Y.Model,[],
	{
		ATTRS:
		{
			x: { value:0 },
			y: { value:0 },
			width: { value:0 },
			height: { value:0 },
			id:  { value:0},
			cellHeight:  { value:0},
			inPreview : { value :0 }
		}

	});

	Y.ScoreCardColumnView = Y.Base.create('scorecardcolumnview',Y.View,[],
	{
		entries: {},
		initializer: function()
		{
			var m = this.get('model')
			var c = this.get('container');
			var name
			if (m.get('id')==0)
			{
				name = '&nbsp;'
			}
			else
			{
				name = players_info[m.get('id')]['login_name']
			}

			c.setStyles({position:'absolute',left:m.get('x'),top:m.get('y'),width:m.get('width'),height:m.get('height'), backgroundColor:'#227722', border:'solid 1px #000000'})


			var tn = Y.Node.create('<div align=center class="name_header" id="sc_'+m.get('id')+'">'+name+'</div>')
			tn.setStyles({width:m.get('width'),height:40})
			c.append(tn)

			this.entries[m.get('id')] = {}
			var starty = m.get('y')+m.get('cellHeight')
			if (m.get('id')!=0)
			{
				for (var i = 0 ; i < 15 ; i++)
				{
					var sce = new Y.ScoreCardEntry({x:m.get('x'),y:starty+m.get('cellHeight')*i,width:m.get('width'),height:m.get('cellHeight'),id:i,score:-1,completed:0,player_id:m.get('id')})
					var scev = new Y.ScoreCardEntryView({model:sce})
					this.get('container').append(scev.get('container'))
					this.entries[m.get('id')][i] = scev
				}
			}
			else
			{
				for (var i = 0 ; i < 15 ; i++)
				{
					var sce = new Y.LegendEntry({x:m.get('x'),y:starty+m.get('cellHeight')*i,width:m.get('width'),height:m.get('cellHeight'),id:i})
					var lev = new Y.LegendEntryView({model:sce})
					this.get('container').append(lev.get('container'))
				}


			}

		},
		showBonus:function(val)
		{
			var m = this.get('model')
			var e = this.entries[m.get('id')][6]
			e.get('container').setHTML('<div align=center style="font-size:28px; font-weigth:bold;">'+val+'</div>')
			e.get('container').setStyles({ backgroundColor:'rgb(174, 174, 174)' })
		},
		showUpperScore:function(val)
		{
			var m = this.get('model')
			var e = this.entries[m.get('id')][7]
			e.get('container').setHTML('<div align=center style="font-size:28px; font-weigth:bold;">'+val+'</div>')
			e.get('container').setStyles({ backgroundColor:'rgb(174, 174, 174)' })
		},
		showGrandTotal:function(val,highest,is_tie)
		{
			var m = this.get('model')
			var e = this.entries[m.get('id')][14]

			if (!is_tie && highest!=m.get('id'))
			{
				e.get('container').setHTML('<div align=center style="font-size:28px; ">'+val+'</div>')
				e.get('container').setStyles({ backgroundColor:'rgb(174, 174, 174)' })
			}
			else
			{
				e.get('container').setHTML('<div align=center style="margin-left:-2px; font-size:38px; font-weight:bold; color:#666600">'+val+'</div>')
				e.get('container').setStyles({ backgroundColor:'rgb(194, 194, 174)' })
				var an = new Y.Anim({
					node: e.get('container'),
					from: { backgroundColor: '#aaaa00' },
					to: { backgroundColor: '#ffca00' },
					duration : 1
				});
				an.on('end',function(evt)
				{
					if (this.get('reverse'))
					{
						this.set('reverse',false);
						this.run();
					}
					else
					{
						this.set('reverse',true);
						this.run();
					}


				});
				an.run()
			}

			if (game.players.self.host)
				setTimeout('parent.main_instance.socket.send(\'c.eg.\');',8000);
			///TODO
			//setTimeout('window.location.href= "/vids/yum"',10000);
		},
		resetColor:function()
		{
			var m = this.get('model')
			for (var i = 0 ; i < 15 ; i++)
			{
				this.entries[m.get('id')][i].get('container').setStyle('backgroundColor','#aaaa22')
			}
		},
		updateCurrentPreview:function(tot,colorCells)
		{

			var m = this.get('model')
			m.set('inPreview',1)
			for (var i = 0 ; i < 15 ; i++)
			{
				var ok=false
				if (tot[i]==0) ok=true
				if ((tot[i] || ok) && !this.entries[m.get('id')][i].get('model').get('completed') && this.entries[m.get('id')][i].get('model').get('id')!=6 && this.entries[m.get('id')][i].get('model').get('id')!=7 && this.entries[m.get('id')][i].get('model').get('id')!=14)
				{
					this.entries[m.get('id')][i].get('model').set('score',tot[i])

					if (colorCells)
						this.entries[m.get('id')][i].get('container').setStyle('backgroundColor','#eeee33')
				}
			}
			this.render()
		},
		updateScores:function(tot)
		{
			var m = this.get('model')
			if (m.get('inPreview')) return
			for (var i = 0 ; i < 15 ; i++)
			{
				if (tot[i]==null)
					this.entries[m.get('id')][i].get('model').set('score',-1)
				else
				{
					this.entries[m.get('id')][i].get('model').set('score',tot[i])
					this.entries[m.get('id')][i].get('model').set('completed',1)
				}
			}

			this.render()
		},
		render: function()
		{
			var m = this.get('model')
			var c = this.get('container');

			for (var i = 0 ; i < 15 ; i++)
			{

				if (i==6 || i==7 || i==14) continue
				var cs = this.entries[m.get('id')][i].get('model').get('score')
				if (cs<0)
				{
					this.entries[m.get('id')][i].get('container').setHTML('<div align=center>&nbsp;</div>')
				}
				else
				{

					this.entries[m.get('id')][i].get('container').setHTML('<div align=center>'+this.entries[m.get('id')][i].get('model').get('score')+'</div>')
				}
			}

			return this;
		}
	});


	Y.LegendEntry = new Y.Base.create('legendentry',Y.Model,[],
	{
		ATTRS:
		{
			x: { value:0 },
			y: { value:0 },
			width: { value:0 },
			height: { value:0 },
			id: { value:0 },
		}

	});

	Y.LegendEntryView = Y.Base.create('legendentryview',Y.View,[],
	{

		initializer: function()
		{
			var m = this.get('model')
			var c = this.get('container');

			c.setStyles({position:'absolute',left:0,top:m.get('y'),width:m.get('width'),height:m.get('height'), backgroundColor:'#ffaa22', border:'solid 1px #000000'})
			this.render()
		},
		render: function()
		{
			var m = this.get('model')
			var c = this.get('container');
			var id = m.get('id')
			var contentd = ''
			if (id==0)
			{
				c.setStyles({fontSize:'24px', lineHeight:'29px',fontWeight:'bold'})
				c.set('align','right')
				var n = Y.Node.create('<div align=center><img style="margin-top:10px;" src="./images/dice-1.png" width=20 height=20></div>')

				contentd=n.getHTML()
			}
			else if (id==1)
			{
				c.setStyles({fontSize:'24px', lineHeight:'29px',fontWeight:'bold'})
				c.set('align','right')
				var n = Y.Node.create('<div align=center><img style="margin-top:10px;" src="./images/dice-2.png" width=20 height=20></div>')

				contentd=n.getHTML()
			}
			else if (id==2)
			{
				c.setStyles({fontSize:'24px', lineHeight:'29px',fontWeight:'bold'})
				c.set('align','right')
				var n = Y.Node.create('<div align=center><img style="margin-top:10px;" src="./images/dice-3.png" width=20 height=20></div>')

				contentd=n.getHTML()
			}
			else if (id==3)
			{
				c.setStyles({fontSize:'24px', lineHeight:'29px',fontWeight:'bold'})
				c.set('align','right')
				var n = Y.Node.create('<div align=center><img style="margin-top:10px;" src="./images/dice-4.png" width=20 height=20></div>')

				contentd=n.getHTML()
			}
			else if (id==4)
			{
				c.setStyles({fontSize:'24px', lineHeight:'29px',fontWeight:'bold'})
				c.set('align','right')
				var n = Y.Node.create('<div align=center><img style="margin-top:10px;" src="./images/dice-5.png" width=20 height=20></div>')

				contentd=n.getHTML()
			}
			else if (id==5)
			{
				c.setStyles({fontSize:'24px', lineHeight:'29px',fontWeight:'bold'})
				c.set('align','right')
				var n = Y.Node.create('<div align=center><img style="margin-top:10px;" src="./images/dice-6.png" width=20 height=20></div>')

				contentd=n.getHTML()
			}
			else if (id==6)
			{
				c.setStyles({fontSize:'24px', lineHeight:'32px',fontWeight:'bold',backgroundColor:'#aeaeae'})
				c.set('align','right')
				contentd = 'Bonus (63+):'

			}
			else if (id==7)
			{
				c.setStyles({fontSize:'24px', lineHeight:'34px',fontWeight:'bold',backgroundColor:'#aeaeae'})
				c.set('align','right')
				contentd = 'Total:'

			}
			else if (id==8)
			{
				c.setStyles({fontSize:'24px', lineHeight:'34px',fontWeight:'bold'})
				c.set('align','right')
				contentd = 'Low (21+):'

			}
			else if (id==9)
			{
				c.setStyles({fontSize:'24px', lineHeight:'34px',fontWeight:'bold'})
				c.set('align','right')
				contentd = 'Hi (22+):'

			}
			else if (id==10)
			{
				c.setStyles({fontSize:'24px', lineHeight:'34px',fontWeight:'bold'})
				c.set('align','right')
				contentd = 'Petite suite:'
			}
			else if (id==11)
			{
				c.setStyles({fontSize:'24px', lineHeight:'34px',fontWeight:'bold'})
				c.set('align','right')
				contentd = 'Grande suite:'
			}
			else if (id==12)
			{
				c.setStyles({fontSize:'24px', lineHeight:'34px',fontWeight:'bold'})
				c.set('align','right')
				contentd = 'Full:'
			}
			else if (id==13)
			{
				c.setStyles({fontSize:'24px', lineHeight:'34px',fontWeight:'bold'})
				c.set('align','right')
				contentd = 'Yum:'
			}
			else if (id==14)
			{
				c.setStyles({fontSize:'24px', lineHeight:'34px',fontWeight:'bold',backgroundColor:'#aeaeae'})
				c.set('align','right')
				contentd = 'Total:'
			}
			c.setHTML('<div style="margin-right:15px">'+contentd+'</div>')
			return this;
		}
	});

function handleResponse(id,response)
{
	//Y.log(response.responseText)

}
}, '1.0', {requires: ['json-parse','json-stringify','console','app','node','model','model-list','view', 'io']});